export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'VIEWER';
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
  createdAt: string;
  updatedAt: string;
}

export interface FixedContent {
  id: string;
  type: string;
  content: string;
  isActive: boolean;
  order: number;
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
