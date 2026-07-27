import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import { attachments } from '../database/schema';
import { EventsService } from '../events/events.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';

@Injectable()
export class AttachmentsService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private configService: ConfigService,
    private eventsService: EventsService,
  ) {
    const region = this.configService.getOrThrow<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    // Explicit credentials required (Railway doesn't have IAM roles)
    const s3Config: Record<string, unknown> = { region };
    if (accessKeyId && secretAccessKey) {
      s3Config.credentials = { accessKeyId, secretAccessKey };
    }

    this.s3Client = new S3Client(s3Config as any);
    this.bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
  }

  async findByEvent(userId: string, eventId: string) {
    // Verify event ownership
    await this.eventsService.findOne(userId, eventId);

    return this.db
      .select()
      .from(attachments)
      .where(eq(attachments.eventId, eventId))
      .orderBy(attachments.createdAt);
  }

  async createUploadUrl(userId: string, eventId: string, dto: CreateAttachmentDto) {
    // Verify event ownership
    await this.eventsService.findOne(userId, eventId);

    const s3Key = `attachments/${eventId}/${uuidv4()}-${dto.fileName}`;

    // Store metadata in DB
    const [attachment] = await this.db
      .insert(attachments)
      .values({
        eventId,
        fileName: dto.fileName,
        s3Key,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
      })
      .returning();

    // Generate pre-signed upload URL
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: dto.fileType || 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      attachment,
      uploadUrl,
    };
  }

  async getDownloadUrl(userId: string, id: string) {
    const [attachment] = await this.db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id))
      .limit(1);

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Verify event ownership
    await this.eventsService.findOne(userId, attachment.eventId);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: attachment.s3Key,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      attachment,
      downloadUrl,
    };
  }

  async remove(userId: string, id: string) {
    const [attachment] = await this.db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id))
      .limit(1);

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Verify event ownership
    await this.eventsService.findOne(userId, attachment.eventId);

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: attachment.s3Key,
    });
    await this.s3Client.send(command);

    // Delete from DB
    await this.db.delete(attachments).where(eq(attachments.id, id));

    return { message: 'Attachment deleted successfully' };
  }
}
