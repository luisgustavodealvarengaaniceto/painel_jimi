export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
  tenant: string;
  createdAt: string;
  updatedAt: string;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  duration: number;
  order: number;
  isActive: boolean;
  expiresAt?: string | null;
  isArchived?: boolean;
  fontSize: number; // Tamanho da fonte em pixels
  tenant: string;
  createdAt: string;
  updatedAt: string;
}

export interface FixedContent {
  id: string;
  type: string;
  content: string;
  isActive: boolean;
  order: number;
  fontSize: number; // Tamanho da fonte em pixels
  tenant: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface CreateSlideRequest {
  title: string;
  content: string;
  duration?: number;
  order?: number;
  isActive?: boolean;
  expiresAt?: string;
  fontSize?: number;
}

export interface UpdateSlideRequest {
  title?: string;
  content?: string;
  duration?: number;
  order?: number;
  isActive?: boolean;
  expiresAt?: string;
  isArchived?: boolean;
  fontSize?: number;
}

export interface CreateFixedContentRequest {
  type: string;
  content: string;
  order?: number;
  fontSize?: number;
}

export interface UpdateFixedContentRequest {
  type?: string;
  content?: string;
  isActive?: boolean;
  order?: number;
  fontSize?: number;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: 'ADMIN' | 'VIEWER';
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  role?: 'ADMIN' | 'VIEWER';
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}
