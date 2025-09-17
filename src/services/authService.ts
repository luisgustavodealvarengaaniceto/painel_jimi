import api from './api';
import type { LoginResponse, User } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  async me(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  async createUser(username: string, password: string, role: 'ADMIN' | 'VIEWER' = 'VIEWER'): Promise<User> {
    const response = await api.post('/auth/users', { username, password, role });
    return response.data.user;
  },
};
