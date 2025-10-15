import React from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slidesService } from '../../services/slidesService';
import { useAuth } from '../../contexts/AuthContext';
import type { Slide } from '../../types';
import { Edit, Trash2, Plus } from 'lucide-react';
import { triggerDisplayUpdate } from '../../hooks/useDisplaySync';

const Container = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
  width: 100%;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const Header = styled.div`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[6]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[4]};
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[4]};
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h2`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: 600;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.xl};
    text-align: center;
  }
`;

const AddButton = styled.button`
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.primary};
  border: none;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.radii.md};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
  transition: all 0.2s;
  justify-content: center;
  width: auto;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing[6]};
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const SlideGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
`;

const SlideCard = styled.div`
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s;
  gap: ${props => props.theme.spacing[4]};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: ${props => props.theme.spacing[3]};
    gap: ${props => props.theme.spacing[3]};
  }
`;

const SlideInfo = styled.div`
  flex: 1;
`;

const SlideTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const SlideDetails = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const SlideDetail = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[600]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const SlideContent = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[700]};
  line-height: 1.4;
  max-height: 3rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-left: ${props => props.theme.spacing[4]};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  background: ${props => 
    props.$variant === 'danger' ? props.theme.colors.error :
    props.$variant === 'primary' ? props.theme.colors.primary :
    props.theme.colors.gray[500]
  };
  color: ${props => props.theme.colors.white};
  border: none;
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.gray[600]};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.error};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[12]};
  color: ${props => props.theme.colors.gray[600]};
`;

const EmptyStateIcon = styled.div`
  font-size: ${props => props.theme.fontSizes['4xl']};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const EmptyStateText = styled.p`
  font-size: ${props => props.theme.fontSizes.lg};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

interface SlidesManagerProps {
  onCreateSlide: () => void;
  onEditSlide: (slide: Slide) => void;
}

const SlidesManager: React.FC<SlidesManagerProps> = ({ onCreateSlide, onEditSlide }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch slides
  const { data: slides = [], isLoading, error } = useQuery({
    queryKey: ['admin-slides', user?.tenant],
    queryFn: slidesService.getAllSlidesForAdmin,
  });

  // Delete slide mutation
  const deleteMutation = useMutation({
    mutationFn: slidesService.deleteSlide,
    onSuccess: () => {
      // Invalidate admin slides for this tenant
      queryClient.invalidateQueries({ queryKey: ['admin-slides', user?.tenant] });
      // Invalidate display slides to update TV display immediately
      queryClient.invalidateQueries({ queryKey: ['slides', user?.tenant] });
      // Trigger cross-tab update notification
      triggerDisplayUpdate();
    },
  });

  const handleDeleteSlide = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este slide?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Erro ao excluir slide');
      }
    }
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>Gerenciar Slides</Title>
        </Header>
        <LoadingMessage>Carregando slides...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Gerenciar Slides</Title>
        </Header>
        <ErrorMessage>Erro ao carregar slides</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gerenciar Slides</Title>
        <AddButton onClick={onCreateSlide}>
          <Plus />
          Novo Slide
        </AddButton>
      </Header>
      
      <Content>
        {slides.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>📊</EmptyStateIcon>
            <EmptyStateText>Nenhum slide encontrado</EmptyStateText>
            <AddButton onClick={onCreateSlide}>
              <Plus />
              Criar Primeiro Slide
            </AddButton>
          </EmptyState>
        ) : (
          <SlideGrid>
            {slides.map((slide) => (
              <SlideCard key={slide.id}>
                <SlideInfo>
                  <SlideTitle>{slide.title}</SlideTitle>
                  <SlideDetails>
                    <SlideDetail>
                      ⏱️ {slide.duration}s
                    </SlideDetail>
                    <SlideDetail>
                      📋 Ordem: {slide.order}
                    </SlideDetail>
                    <SlideDetail>
                      {slide.isActive ? '✅ Ativo' : '❌ Inativo'}
                    </SlideDetail>
                  </SlideDetails>
                  <SlideContent>
                    {stripHtml(slide.content)}
                  </SlideContent>
                </SlideInfo>
                
                <Actions>
                  <ActionButton 
                    $variant="primary" 
                    onClick={() => onEditSlide(slide)}
                    title="Editar slide"
                  >
                    <Edit />
                  </ActionButton>
                  <ActionButton 
                    $variant="danger" 
                    onClick={() => handleDeleteSlide(slide.id)}
                    title="Excluir slide"
                  >
                    <Trash2 />
                  </ActionButton>
                </Actions>
              </SlideCard>
            ))}
          </SlideGrid>
        )}
      </Content>
    </Container>
  );
};

export default SlidesManager;
