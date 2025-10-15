import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { getSlideImages } from '../services/attachmentService';

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-top: 1rem;
  }
`;

const ImageWrapper = styled.img`
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    max-height: 200px;
  }
`;

interface SlideImagesProps {
  slideId: number;
  enabled?: boolean; // Permite controlar quando a query deve executar
}

const SlideImages: React.FC<SlideImagesProps> = ({ slideId, enabled = true }) => {
  const { data: images = [], isLoading, isError } = useQuery({
    queryKey: ['slideImages', slideId],
    queryFn: () => getSlideImages(slideId),
    staleTime: 30000,
    retry: false, // Não tentar novamente em caso de erro
    enabled: enabled && !!slideId, // Só executar se slideId existir E enabled for true
  });

  // Não renderizar nada se houver erro, estiver carregando ou não houver imagens
  if (isError || isLoading || !images || images.length === 0) {
    return null;
  }


  return (
    <ImagesGrid>
      {images.map((image) => (
        <ImageWrapper
          key={image.id}
          src={`/api${image.fileUrl}`}
          alt={image.fileName}
          loading="lazy"
        />
      ))}
    </ImagesGrid>
  );
};

export default SlideImages;