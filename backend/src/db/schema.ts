import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').$type<'ADMIN' | 'VIEWER'>().notNull().default('VIEWER'),
  tenant: text('tenant').notNull().default('default'), // Multi-tenancy: default, akroz, etc
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
  expiresAt: timestamp('expires_at'),
  isArchived: boolean('is_archived').notNull().default(false),
  fontSize: integer('font_size').notNull().default(16), // Tamanho da fonte em pixels
  tenant: text('tenant').notNull().default('default'), // Multi-tenancy
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Slide Attachments table (para imagens)
export const slideAttachments = pgTable('slide_attachments', {
  id: serial('id').primaryKey(),
  slideId: integer('slide_id').notNull().references(() => slides.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Fixed Content table
export const fixedContent = pgTable('fixed_content', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  content: text('content').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  order: integer('order').notNull().default(0),
  fontSize: integer('font_size').notNull().default(14), // Tamanho da fonte em pixels
  tenant: text('tenant').notNull().default('default'), // Multi-tenancy
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertSlideSchema = createInsertSchema(slides);
export const selectSlideSchema = createSelectSchema(slides);

export const insertSlideAttachmentSchema = createInsertSchema(slideAttachments);
export const selectSlideAttachmentSchema = createSelectSchema(slideAttachments);

export const insertFixedContentSchema = createInsertSchema(fixedContent);
export const selectFixedContentSchema = createSelectSchema(fixedContent);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Slide = typeof slides.$inferSelect;
export type NewSlide = typeof slides.$inferInsert;

export type SlideAttachment = typeof slideAttachments.$inferSelect;
export type NewSlideAttachment = typeof slideAttachments.$inferInsert;

export type FixedContent = typeof fixedContent.$inferSelect;
export type NewFixedContent = typeof fixedContent.$inferInsert;