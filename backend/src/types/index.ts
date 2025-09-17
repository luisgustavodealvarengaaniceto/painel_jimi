import { Request } from 'express';

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
  createdAt: Date;
  updatedAt: Date;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  duration: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FixedContent {
  id: string;
  type: string;
  content: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateSlideRequest {
  title: string;
  content: string;
  duration?: number;
  order?: number;
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
}

export interface UpdateFixedContentRequest {
  type?: string;
  content?: string;
  isActive?: boolean;
  order?: number;
}
