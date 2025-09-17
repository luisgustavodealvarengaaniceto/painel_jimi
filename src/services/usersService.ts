import api from './api';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types';

export interface UsersResponse {
  users: User[];
  total: number;
}

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }
};
