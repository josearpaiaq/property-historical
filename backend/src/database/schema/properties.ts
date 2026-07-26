import { pgTable, uuid, varchar, text, timestamp, date } from 'drizzle-orm/pg-core';
import { users } from './users';

export const propertyTypeEnum = ['house', 'apartment', 'land', 'commercial', 'other'] as const;
export type PropertyType = (typeof propertyTypeEnum)[number];

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  type: varchar('type', { length: 50 }).$type<PropertyType>(),
  purchaseDate: date('purchase_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
