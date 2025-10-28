import { pgTable, varchar, timestamp, serial, integer } from 'drizzle-orm/pg-core';
import { users } from './userSchema.js';

export const bins = pgTable('bins', {
  id: serial('id').primaryKey(),
  binId: varchar('bin_id', { length: 36 }).unique().notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});