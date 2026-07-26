import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { events } from './events';

export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  s3Key: varchar('s3_key', { length: 512 }).notNull(),
  fileType: varchar('file_type', { length: 100 }),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
