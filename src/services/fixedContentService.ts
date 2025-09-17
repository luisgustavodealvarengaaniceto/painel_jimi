import api from './api';
import type { FixedContent, CreateFixedContentRequest, UpdateFixedContentRequest } from '../types';

export const fixedContentService = {
  async getAllFixedContent(): Promise<FixedContent[]> {
    const response = await api.get('/fixed-content');
    return response.data.content;
  },

  async getFixedContentById(id: string): Promise<FixedContent> {
    const response = await api.get(`/fixed-content/${id}`);
    return response.data.content;
  },

  async createFixedContent(content: CreateFixedContentRequest): Promise<FixedContent> {
    const response = await api.post('/fixed-content', content);
    return response.data.content;
  },

  async updateFixedContent(id: string, content: UpdateFixedContentRequest): Promise<FixedContent> {
    const response = await api.put(`/fixed-content/${id}`, content);
    return response.data.content;
  },

  async deleteFixedContent(id: string): Promise<void> {
    await api.delete(`/fixed-content/${id}`);
  },
};
