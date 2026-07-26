import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../database/drizzle.provider';
import { reminders, events } from '../database/schema';
import { PropertiesService } from '../properties/properties.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private propertiesService: PropertiesService,
  ) {}

  async findAllByProperty(userId: string, propertyId: string) {
    // Verify property ownership
    await this.propertiesService.findOne(userId, propertyId);

    return this.db
      .select()
      .from(reminders)
      .where(eq(reminders.propertyId, propertyId))
      .orderBy(reminders.nextDueAt);
  }

  async findOne(userId: string, id: string) {
    const [reminder] = await this.db
      .select()
      .from(reminders)
      .where(eq(reminders.id, id))
      .limit(1);

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    // Verify property ownership
    await this.propertiesService.findOne(userId, reminder.propertyId);

    return reminder;
  }

  async create(userId: string, propertyId: string, dto: CreateReminderDto) {
    // Verify property ownership
    await this.propertiesService.findOne(userId, propertyId);

    const [reminder] = await this.db
      .insert(reminders)
      .values({
        propertyId,
        title: dto.title,
        description: dto.description,
        frequencyDays: dto.frequencyDays,
        nextDueAt: new Date(dto.nextDueAt),
      })
      .returning();

    return reminder;
  }

  async update(userId: string, id: string, dto: UpdateReminderDto) {
    // Verify ownership
    await this.findOne(userId, id);

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.frequencyDays !== undefined) updateData.frequencyDays = dto.frequencyDays;
    if (dto.nextDueAt !== undefined) updateData.nextDueAt = new Date(dto.nextDueAt);
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const [reminder] = await this.db
      .update(reminders)
      .set(updateData)
      .where(eq(reminders.id, id))
      .returning();

    return reminder;
  }

  async remove(userId: string, id: string) {
    // Verify ownership
    await this.findOne(userId, id);

    await this.db.delete(reminders).where(eq(reminders.id, id));

    return { message: 'Reminder deleted successfully' };
  }

  async complete(userId: string, id: string) {
    const reminder = await this.findOne(userId, id);

    const now = new Date();
    const nextDueAt = new Date(now.getTime() + reminder.frequencyDays * 24 * 60 * 60 * 1000);

    // Update reminder
    const [updatedReminder] = await this.db
      .update(reminders)
      .set({
        lastCompletedAt: now,
        nextDueAt,
      })
      .where(eq(reminders.id, id))
      .returning();

    // Auto-create event log for the completed reminder
    const [event] = await this.db
      .insert(events)
      .values({
        propertyId: reminder.propertyId,
        title: `Completed: ${reminder.title}`,
        description: reminder.description || `Recurring maintenance completed`,
        date: now.toISOString().split('T')[0],
        category: 'general',
        status: 'completed',
      })
      .returning();

    return {
      reminder: updatedReminder,
      event,
    };
  }
}
