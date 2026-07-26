import { pgTable, uuid, varchar, text, timestamp, date, decimal } from 'drizzle-orm/pg-core';
import { properties } from './properties';

export const eventCategoryEnum = [
  'plumbing',
  'electrical',
  'structural',
  'hvac',
  'painting',
  'landscaping',
  'appliances',
  'general',
  'other',
] as const;
export type EventCategory = (typeof eventCategoryEnum)[number];

export const eventStatusEnum = ['planned', 'in-progress', 'completed'] as const;
export type EventStatus = (typeof eventStatusEnum)[number];

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id')
    .references(() => properties.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  date: date('date').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  category: varchar('category', { length: 50 }).$type<EventCategory>(),
  status: varchar('status', { length: 20 }).$type<EventStatus>().default('planned'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
