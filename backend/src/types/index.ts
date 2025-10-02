import { Request } from 'express';

export type UserRole = 'ADMIN' | 'VIEWER';

export interface AuthenticatedUser {
  id: number;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  role?: UserRole;
}

export interface CreateSlideRequest {
  title: string;
  content: string;
  duration?: number;
  order?: number;
  isActive?: boolean;
}

export interface UpdateSlideRequest {
  title?: string;
  content?: string;
  duration?: number;
  order?: number;
  isActive?: boolean;
}

export interface CreateFixedContentRequest {
  type: string;
  content: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateFixedContentRequest {
  type?: string;
  content?: string;
  isActive?: boolean;
  order?: number;
}
