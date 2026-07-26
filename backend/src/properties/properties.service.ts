import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import { properties } from '../database/schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findAll(userId: string) {
    return this.db
      .select()
      .from(properties)
      .where(eq(properties.userId, userId))
      .orderBy(properties.createdAt);
  }

  async findOne(userId: string, id: string) {
    const [property] = await this.db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, userId)))
      .limit(1);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async create(userId: string, dto: CreatePropertyDto) {
    const [property] = await this.db
      .insert(properties)
      .values({
        userId,
        name: dto.name,
        address: dto.address,
        type: dto.type,
        purchaseDate: dto.purchaseDate,
        notes: dto.notes,
      })
      .returning();

    return property;
  }

  async update(userId: string, id: string, dto: UpdatePropertyDto) {
    // Verify ownership
    await this.findOne(userId, id);

    const [property] = await this.db
      .update(properties)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(and(eq(properties.id, id), eq(properties.userId, userId)))
      .returning();

    return property;
  }

  async remove(userId: string, id: string) {
    // Verify ownership
    await this.findOne(userId, id);

    await this.db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, userId)));

    return { message: 'Property deleted successfully' };
  }
}
