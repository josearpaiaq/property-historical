import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, gte, lte, ilike, or, desc } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import { events } from '../database/schema';
import { PropertiesService } from '../properties/properties.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventsDto } from './dto/filter-events.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private propertiesService: PropertiesService,
  ) {}

  async findAllByProperty(userId: string, propertyId: string, filters: FilterEventsDto) {
    // Verify property ownership
    await this.propertiesService.findOne(userId, propertyId);

    const conditions = [eq(events.propertyId, propertyId)];

    if (filters.category) {
      conditions.push(eq(events.category, filters.category));
    }
    if (filters.status) {
      conditions.push(eq(events.status, filters.status));
    }
    if (filters.dateFrom) {
      conditions.push(gte(events.date, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(events.date, filters.dateTo));
    }
    if (filters.costMin) {
      conditions.push(gte(events.cost, filters.costMin));
    }
    if (filters.costMax) {
      conditions.push(lte(events.cost, filters.costMax));
    }

    let query = this.db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.date));

    if (filters.search) {
      const searchCondition = or(
        ilike(events.title, `%${filters.search}%`),
        ilike(events.description, `%${filters.search}%`),
      );
      query = this.db
        .select()
        .from(events)
        .where(and(...conditions, searchCondition))
        .orderBy(desc(events.date));
    }

    return query;
  }

  async findOne(userId: string, id: string) {
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Verify property ownership
    await this.propertiesService.findOne(userId, event.propertyId);

    return event;
  }

  async create(userId: string, propertyId: string, dto: CreateEventDto) {
    // Verify property ownership
    await this.propertiesService.findOne(userId, propertyId);

    const [event] = await this.db
      .insert(events)
      .values({
        propertyId,
        title: dto.title,
        description: dto.description,
        date: dto.date,
        cost: dto.cost,
        category: dto.category,
        status: dto.status || 'planned',
      })
      .returning();

    return event;
  }

  async update(userId: string, id: string, dto: UpdateEventDto) {
    // Verify ownership chain
    await this.findOne(userId, id);

    const [event] = await this.db
      .update(events)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    return event;
  }

  async remove(userId: string, id: string) {
    // Verify ownership chain
    await this.findOne(userId, id);

    await this.db.delete(events).where(eq(events.id, id));

    return { message: 'Event deleted successfully' };
  }
}
