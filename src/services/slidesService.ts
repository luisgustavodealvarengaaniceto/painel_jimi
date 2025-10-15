import api from './api';
import type { Slide, CreateSlideRequest, UpdateSlideRequest } from '../types';

export const slidesService = {
  async getAllSlides(): Promise<Slide[]> {
    const response = await api.get('/slides');
    return response.data.slides;
  },

  async getAllSlidesForAdmin(): Promise<Slide[]> {
    const response = await api.get('/slides');
    return response.data.slides;
  },

  async getSlideById(id: string): Promise<Slide> {
    const response = await api.get(`/slides/${id}`);
    return response.data.slide;
  },

  async createSlide(slide: CreateSlideRequest): Promise<Slide> {
    const response = await api.post('/slides', slide);
    return response.data.slide;
  },

  async updateSlide(id: string, slide: UpdateSlideRequest): Promise<Slide> {
    const response = await api.put(`/slides/${id}`, slide);
    return response.data.slide;
  },

  async deleteSlide(id: string): Promise<void> {
    await api.delete(`/slides/${id}`);
  },

  async reorderSlides(slideOrders: { id: string; order: number }[]): Promise<void> {
    await api.post('/slides/reorder', { slideOrders });
  },

  async uploadAttachment(slideId: string, formData: FormData): Promise<any> {
    const response = await api.post(`/slides/${slideId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getAttachments(slideId: string): Promise<any[]> {
    const response = await api.get(`/slides/${slideId}/attachments`);
    return response.data.attachments;
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    await api.delete(`/slides/attachments/${attachmentId}`);
  },

  async getArchivedSlides(): Promise<{ expiredSlides: Slide[], manuallyArchivedSlides: Slide[], total: number }> {
    const response = await api.get('/slides/archived/list');
    return response.data;
  },
};
