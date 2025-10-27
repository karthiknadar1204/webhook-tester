import { pgTable, varchar, timestamp, serial } from 'drizzle-orm/pg-core';

export const bins = pgTable('bins', {
  id: serial('id').primaryKey(),
  binId: varchar('bin_id', { length: 36 }).unique().notNull(),  // UUID like 'xyz123'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),  // Optional expiration
});