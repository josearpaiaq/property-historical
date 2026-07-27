import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get('events/:eventId/attachments')
  findByEvent(
    @CurrentUser() user: AuthUser,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.attachmentsService.findByEvent(user.id, eventId);
  }

  @Post('events/:eventId/attachments')
  createUploadUrl(
    @CurrentUser() user: AuthUser,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() dto: CreateAttachmentDto,
  ) {
    return this.attachmentsService.createUploadUrl(user.id, eventId, dto);
  }

  @Get('attachments/:id')
  getDownloadUrl(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.attachmentsService.getDownloadUrl(user.id, id);
  }

  @Delete('attachments/:id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.attachmentsService.remove(user.id, id);
  }
}
