import React from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { Archive, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { slidesService } from '../../services/slidesService';
import { useAuth } from '../../contexts/AuthContext';
import type { Slide } from '../../types';

const Container = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.gray[50]};
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};

  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: 600;
  color: ${props => props.theme.colors.gray[900]};
  margin: 0;
`;

const Badge = styled.span`
  background: ${props => props.theme.colors.gray[100]};
  color: ${props => props.theme.colors.gray[700]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: 500;
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing[6]};
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing[8]};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: 600;
  margin: 0;
`;

const ExpiredTitle = styled(SectionTitle)`
  color: ${props => props.theme.colors.error};
`;

const ArchivedTitle = styled(SectionTitle)`
  color: ${props => props.theme.colors.gray[600]};
`;

const SlideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
`;

const SlideItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.gray[50]};
  border-radius: ${props => props.theme.radii.md};
  border-left: 4px solid;
`;

const ExpiredSlide = styled(SlideItem)`
  border-left-color: ${props => props.theme.colors.error};
  background: #fef2f2;
`;

const ManuallyArchivedSlide = styled(SlideItem)`
  border-left-color: ${props => props.theme.colors.gray[400]};
`;

const SlideInfo = styled.div`
  flex: 1;
`;

const SlideTitle = styled.h4`
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: 500;
  margin: 0 0 ${props => props.theme.spacing[1]} 0;
  color: ${props => props.theme.colors.gray[900]};
`;

const SlideMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[600]};
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.gray[500]};
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.gray[500]};
`;

const ErrorMessage = styled.div`
  padding: ${props => props.theme.spacing[4]};
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.error};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' às ' + date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SlideItemComponent: React.FC<{ slide: Slide; isExpired: boolean }> = ({ slide, isExpired }) => {
  const SlideComponent = isExpired ? ExpiredSlide : ManuallyArchivedSlide;
  
  return (
    <SlideComponent>
      <SlideInfo>
        <SlideTitle>{slide.title}</SlideTitle>
        <SlideMetadata>
          <MetadataItem>
            <Calendar />
            Criado: {formatDate(slide.createdAt)}
          </MetadataItem>
          {slide.expiresAt && (
            <MetadataItem>
              <Clock />
              {isExpired ? 'Expirado' : 'Expira'}: {formatDate(slide.expiresAt)}
            </MetadataItem>
          )}
          {isExpired && (
            <MetadataItem>
              <AlertTriangle />
              Arquivado automaticamente
            </MetadataItem>
          )}
        </SlideMetadata>
      </SlideInfo>
    </SlideComponent>
  );
};

const ArchivedSlidesViewer: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['archived-slides', user?.tenant],
    queryFn: slidesService.getArchivedSlides,
    enabled: user?.role === 'ADMIN', // Only run if user is admin
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    refetchOnWindowFocus: false, // Disable auto-refetch to prevent permission errors
  });

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Archive />
          <Title>Slides Arquivados</Title>
        </Header>
        <Loading>Carregando slides arquivados...</Loading>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Archive />
          <Title>Slides Arquivados</Title>
        </Header>
        <Content>
          <ErrorMessage>
            Erro ao carregar slides arquivados. Tente novamente.
          </ErrorMessage>
        </Content>
      </Container>
    );
  }

  const { expiredSlides, manuallyArchivedSlides, total } = data || { 
    expiredSlides: [], 
    manuallyArchivedSlides: [], 
    total: 0 
  };

  return (
    <Container>
      <Header>
        <Archive />
        <Title>Slides Arquivados</Title>
        <Badge>{total} total</Badge>
      </Header>
      <Content>
        {total === 0 ? (
          <EmptyState>
            Nenhum slide arquivado encontrado.
          </EmptyState>
        ) : (
          <>
            {expiredSlides.length > 0 && (
              <Section>
                <SectionHeader>
                  <AlertTriangle color="currentColor" />
                  <ExpiredTitle>Slides Expirados ({expiredSlides.length})</ExpiredTitle>
                </SectionHeader>
                <SlideList>
                  {expiredSlides.map((slide) => (
                    <SlideItemComponent 
                      key={slide.id} 
                      slide={slide} 
                      isExpired={true} 
                    />
                  ))}
                </SlideList>
              </Section>
            )}

            {manuallyArchivedSlides.length > 0 && (
              <Section>
                <SectionHeader>
                  <Archive color="currentColor" />
                  <ArchivedTitle>Slides Arquivados Manualmente ({manuallyArchivedSlides.length})</ArchivedTitle>
                </SectionHeader>
                <SlideList>
                  {manuallyArchivedSlides.map((slide) => (
                    <SlideItemComponent 
                      key={slide.id} 
                      slide={slide} 
                      isExpired={false} 
                    />
                  ))}
                </SlideList>
              </Section>
            )}
          </>
        )}
      </Content>
    </Container>
  );
};

export default ArchivedSlidesViewer;