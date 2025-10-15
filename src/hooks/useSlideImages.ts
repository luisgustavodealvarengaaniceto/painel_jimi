import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadSlideImage, deleteSlideImage } from '../services/attachmentService';
import { useAuth } from '../contexts/AuthContext';

export const useSlideImages = (slideId: number) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Mutation para upload
  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) => uploadSlideImage(slideId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slide-images', slideId] });
      queryClient.invalidateQueries({ queryKey: ['admin-slides', user?.tenant] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao fazer upload da imagem');
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => deleteSlideImage(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slide-images', slideId] });
      queryClient.invalidateQueries({ queryKey: ['admin-slides', user?.tenant] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao deletar imagem');
    },
  });

  const uploadImage = async (file: File) => {
    setError(null);
    setUploading(true);
    
    try {
      await uploadMutation.mutateAsync({ file });
    } catch (err) {
      // Error handled in mutation
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (attachmentId: string) => {
    setError(null);
    try {
      await deleteMutation.mutateAsync(attachmentId);
    } catch (err) {
      // Error handled in mutation
    }
  };

  const uploadMultipleImages = async (files: File[]) => {
    setError(null);
    setUploading(true);
    
    try {
      // Upload sequencial para evitar sobrecarga
      for (const file of files) {
        await uploadMutation.mutateAsync({ file });
      }
    } catch (err) {
      // Error handled in mutation
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading: uploading || uploadMutation.isPending,
    deleting: deleteMutation.isPending,
    error,
    uploadImage,
    deleteImage,
    uploadMultipleImages,
    clearError: () => setError(null),
  };
};