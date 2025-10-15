import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { keyframes } from 'styled-components';
import { Upload, X, AlertCircle } from 'lucide-react';
import { uploadSlideImage, deleteSlideImage, type SlideAttachment } from '../../services/attachmentService';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.gray[800]};
  font-size: 0.9rem;
`;

const DropzoneContainer = styled.div<{ isDragActive: boolean; hasError: boolean }>`
  border: 2px dashed ${props => 
    props.hasError 
      ? props.theme.colors.error 
      : props.isDragActive 
        ? props.theme.colors.primary 
        : props.theme.colors.gray[300]
  };
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => 
    props.hasError
      ? `${props.theme.colors.error}10`
      : props.isDragActive 
        ? `${props.theme.colors.primary}10` 
        : props.theme.colors.background
  };

  &:hover {
    border-color: ${props => props.hasError ? props.theme.colors.error : props.theme.colors.primary};
    background-color: ${props => 
      props.hasError
        ? `${props.theme.colors.error}15`
        : `${props.theme.colors.primary}15`
    };
  }
`;

const DropzoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const IconContainer = styled.div<{ hasError: boolean }>`
  color: ${props => props.hasError ? props.theme.colors.error : props.theme.colors.gray[500]};
  font-size: 2rem;
`;

const DropzoneText = styled.div<{ hasError: boolean }>`
  color: ${props => props.hasError ? props.theme.colors.error : props.theme.colors.gray[600]};
  font-size: 0.9rem;
  line-height: 1.5;
`;

const UploadedImagesList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ImageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.gray[50]};
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.gray[200]};
  animation: ${fadeIn} 0.3s ease;
`;

const ImagePreview = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid ${props => props.theme.colors.gray[200]};
`;

const ImageInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ImageName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.gray[800]};
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ImageSize = styled.div`
  color: ${props => props.theme.colors.gray[600]};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.error};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.error}20;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingState = styled.div`
  color: ${props => props.theme.colors.gray[600]};
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

interface ImageUploaderProps {
  slideId: number;
  images: SlideAttachment[];
  onImagesChange: (images: SlideAttachment[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  slideId,
  images,
  onImagesChange,
  maxFiles = 5,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Garantir que images sempre seja um array válido
  const safeImages = images || [];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);

    // Verificar limites
    if (safeImages.length + acceptedFiles.length > maxFiles) {
      setError(`Máximo de ${maxFiles} imagens permitidas`);
      return;
    }

    try {
      setUploading(true);

      const uploadPromises = acceptedFiles.map(async (file) => {
        // Verificar tamanho
        if (file.size > maxSizeBytes) {
          throw new Error(`Arquivo ${file.name} é muito grande. Máximo ${formatFileSize(maxSizeBytes)}`);
        }

        return uploadSlideImage(slideId, file);
      });

      const uploadedImages = await Promise.all(uploadPromises);
      onImagesChange([...safeImages, ...uploadedImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload das imagens');
    } finally {
      setUploading(false);
    }
  }, [slideId, safeImages, onImagesChange, maxFiles, maxSizeBytes]);

  const removeImage = async (imageId: string) => {
    try {
      // Deletar a imagem no backend
      await deleteSlideImage(imageId);
      
      // Atualizar o estado local removendo a imagem
      const updatedImages = safeImages.filter(img => img.id !== imageId);
      onImagesChange(updatedImages);
    } catch (err) {
      setError('Erro ao remover imagem');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: uploading || safeImages.length >= maxFiles
  });

  const canUploadMore = safeImages.length < maxFiles;

  return (
    <Container>
      <Label>Imagens do Slide</Label>
      
      {canUploadMore && (
        <DropzoneContainer 
          {...getRootProps()} 
          isDragActive={isDragActive}
          hasError={!!error}
        >
          <input {...getInputProps()} />
          <DropzoneContent>
            <IconContainer hasError={!!error}>
              {error ? <AlertCircle size={32} /> : <Upload size={32} />}
            </IconContainer>
            <DropzoneText hasError={!!error}>
              {error ? (
                error
              ) : isDragActive ? (
                'Solte as imagens aqui...'
              ) : (
                <>
                  Arraste imagens aqui ou clique para selecionar
                  <br />
                  <small>Máximo {maxFiles} imagens, até {formatFileSize(maxSizeBytes)} cada</small>
                </>
              )}
            </DropzoneText>
          </DropzoneContent>
        </DropzoneContainer>
      )}

      {uploading && (
        <LoadingState>
          <Upload size={16} />
          Fazendo upload das imagens...
        </LoadingState>
      )}

      {error && !uploading && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
        </ErrorMessage>
      )}

      {safeImages.length > 0 && (
        <UploadedImagesList>
          {safeImages.map((image) => (
            <ImageItem key={image.id}>
              <ImagePreview 
                src={`/api${image.fileUrl}`} 
                alt={image.fileName}
                onError={(e) => {
                  // Fallback para ícone se a imagem não carregar
                  const fallback = document.createElement('div');
                  fallback.style.cssText = 'display: flex; align-items: center; width: 40px; height: 40px; justify-content: center; border: 1px solid #ddd; border-radius: 4px; background: #f5f5f5;';
                  fallback.innerHTML = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="m21 19-3-2V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10l-3 2a1 1 0 0 0 0 1.4l2 2a1 1 0 0 0 1.4 0L9 20h6l2.6 2.6a1 1 0 0 0 1.4 0l2-2a1 1 0 0 0 0-1.4ZM10 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>';
                  e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget);
                }}
              />
              <ImageInfo>
                <ImageName>{image.fileName}</ImageName>
                <ImageSize>{formatFileSize(image.fileSize)}</ImageSize>
              </ImageInfo>
              <RemoveButton onClick={() => removeImage(image.id)}>
                <X size={16} />
              </RemoveButton>
            </ImageItem>
          ))}
        </UploadedImagesList>
      )}
    </Container>
  );
};

export default ImageUploader;