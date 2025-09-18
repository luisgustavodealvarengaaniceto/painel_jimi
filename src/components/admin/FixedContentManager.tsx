import React from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fixedContentService } from '../../services/fixedContentService';
import type { FixedContent } from '../../types';
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
`;

const ContentGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
`;

const ContentCard = styled.div`
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const ContentInfo = styled.div`
  flex: 1;
`;

const ContentType = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const ContentDetails = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const ContentDetail = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[600]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const ContentPreview = styled.div`
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

interface FixedContentManagerProps {
  onCreateContent: () => void;
  onEditContent: (content: FixedContent) => void;
}

const FixedContentManager: React.FC<FixedContentManagerProps> = ({ 
  onCreateContent, 
  onEditContent 
}) => {
  const queryClient = useQueryClient();

  // Fetch content
  const { data: contents = [], isLoading, error } = useQuery({
    queryKey: ['admin-fixed-content'],
    queryFn: fixedContentService.getAllFixedContent,
  });

  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: fixedContentService.deleteFixedContent,
    onSuccess: () => {
      // Invalidate admin fixed content
      queryClient.invalidateQueries({ queryKey: ['admin-fixed-content'] });
      // Invalidate display fixed content to update TV display immediately
      queryClient.invalidateQueries({ queryKey: ['fixedContent'] });
      // Trigger cross-tab update notification
      triggerDisplayUpdate();
    },
  });

  const handleDeleteContent = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Erro ao excluir conteúdo');
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
          <Title>Gerenciar Conteúdo Fixo</Title>
        </Header>
        <LoadingMessage>Carregando conteúdo...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Gerenciar Conteúdo Fixo</Title>
        </Header>
        <ErrorMessage>Erro ao carregar conteúdo</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gerenciar Conteúdo Fixo</Title>
        <AddButton onClick={onCreateContent}>
          <Plus />
          Novo Conteúdo
        </AddButton>
      </Header>
      
      <Content>
        {contents.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>📌</EmptyStateIcon>
            <EmptyStateText>Nenhum conteúdo encontrado</EmptyStateText>
            <AddButton onClick={onCreateContent}>
              <Plus />
              Criar Primeiro Conteúdo
            </AddButton>
          </EmptyState>
        ) : (
          <ContentGrid>
            {contents.map((content) => (
              <ContentCard key={content.id}>
                <ContentInfo>
                  <ContentType>{content.type}</ContentType>
                  <ContentDetails>
                    <ContentDetail>
                      📋 Ordem: {content.order}
                    </ContentDetail>
                    <ContentDetail>
                      {content.isActive ? '✅ Ativo' : '❌ Inativo'}
                    </ContentDetail>
                  </ContentDetails>
                  <ContentPreview>
                    {stripHtml(content.content)}
                  </ContentPreview>
                </ContentInfo>
                
                <Actions>
                  <ActionButton 
                    $variant="primary" 
                    onClick={() => onEditContent(content)}
                    title="Editar conteúdo"
                  >
                    <Edit />
                  </ActionButton>
                  <ActionButton 
                    $variant="danger" 
                    onClick={() => handleDeleteContent(content.id)}
                    title="Excluir conteúdo"
                  >
                    <Trash2 />
                  </ActionButton>
                </Actions>
              </ContentCard>
            ))}
          </ContentGrid>
        )}
      </Content>
    </Container>
  );
};

export default FixedContentManager;
