import api from './api';

export interface SlideAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  order: number;
  createdAt: string;
}

// Upload de imagem para um slide
export const uploadSlideImage = async (slideId: number, file: File): Promise<SlideAttachment> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(
    `/slides/${slideId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.attachment;
};

// Buscar imagens de um slide
export const getSlideImages = async (slideId: number): Promise<SlideAttachment[]> => {
  const response = await api.get(`/slides/${slideId}/attachments`);
  return response.data;
};

// Deletar uma imagem
export const deleteSlideImage = async (attachmentId: string): Promise<void> => {
  await api.delete(`/slides/attachments/${attachmentId}`);
};

// Reordenar imagens
export const reorderSlideImages = async (slideId: number, attachments: { id: string; order: number }[]): Promise<void> => {
  await api.patch(`/slides/${slideId}/attachments/reorder`, { attachments });
};