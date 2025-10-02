import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').$type<'ADMIN' | 'VIEWER'>().notNull().default('VIEWER'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Slides table
export const slides = pgTable('slides', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  duration: integer('duration').notNull().default(5000),
  order: integer('order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Fixed Content table
export const fixedContent = pgTable('fixed_content', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  content: text('content').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertSlideSchema = createInsertSchema(slides);
export const selectSlideSchema = createSelectSchema(slides);

export const insertFixedContentSchema = createInsertSchema(fixedContent);
export const selectFixedContentSchema = createSelectSchema(fixedContent);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Slide = typeof slides.$inferSelect;
export type NewSlide = typeof slides.$inferInsert;

export type FixedContent = typeof fixedContent.$inferSelect;
export type NewFixedContent = typeof fixedContent.$inferInsert;