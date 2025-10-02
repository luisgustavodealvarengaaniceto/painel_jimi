import type { User as DbUser, Slide as DbSlide, FixedContent as DbFixedContent } from '../db/schema';

type UserRecord = Pick<DbUser, 'id' | 'username' | 'role' | 'createdAt' | 'updatedAt'> & {
  password?: string | null;
};

const toIsoString = (value: Date | string | null | undefined) => {
  if (!value) {
    return new Date().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

export const serializeUser = (user: UserRecord) => ({
  id: user.id.toString(),
  username: user.username,
  role: user.role,
  createdAt: toIsoString(user.createdAt),
  updatedAt: toIsoString(user.updatedAt),
});

export const serializeSlide = (slide: DbSlide) => ({
  id: slide.id.toString(),
  title: slide.title,
  content: slide.content,
  duration: slide.duration,
  order: slide.order,
  isActive: slide.isActive,
  createdAt: toIsoString(slide.createdAt),
  updatedAt: toIsoString(slide.updatedAt),
});

export const serializeFixedContent = (content: DbFixedContent) => ({
  id: content.id.toString(),
  type: content.type,
  content: content.content,
  isActive: content.isActive,
  order: content.order,
  createdAt: toIsoString(content.createdAt),
  updatedAt: toIsoString(content.updatedAt),
});
