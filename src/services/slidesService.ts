import api from './api';
import type { Slide, CreateSlideRequest, UpdateSlideRequest } from '../types';

export const slidesService = {
  async getAllSlides(): Promise<Slide[]> {
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
};
