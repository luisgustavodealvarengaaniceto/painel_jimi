import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { slidesService } from '../services/slidesService';
import { fixedContentService } from '../services/fixedContentService';

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  background: ${props => props.theme.colors.white};
  overflow: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FixedSection = styled.div`
  width: 25%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[6]};
  position: relative;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 300px;
    padding: ${props => props.theme.spacing[4]};
    gap: ${props => props.theme.spacing[4]};
  }
`;

const DynamicSection = styled.div`
  width: 75%;
  background: ${props => props.theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[8]};
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
    flex: 1;
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Logo = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[4]} 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const LogoText = styled.h1`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: 700;
  margin-bottom: ${props => props.theme.spacing[2]};
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.xl};
  }
`;

const LogoSubtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.xs};
  }
`;

const DateTime = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[4]} 0;
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[2]} 0;
  }
`;

const DateDisplay = styled.div`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing[1]};
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.base};
  }
`;

const Time = styled.div`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: 700;
  font-family: ${props => props.theme.fonts.secondary};
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes['2xl']};
  }
`;

const FixedContentItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.radii.lg};
  backdrop-filter: blur(10px);
`;

const FixedContentTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const FixedContentText = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  line-height: 1.5;
`;

const SlideContainer = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: ${props => props.theme.spacing[12]};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateX(${props => props.$isVisible ? '0' : '100px'});
  transition: all 0.8s ease-in-out;
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[6]};
  }
`;

const SlideTitle = styled.h1`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: ${props => props.theme.fontSizes['5xl']};
  font-weight: 700;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing[8]};
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes['3xl']};
    margin-bottom: ${props => props.theme.spacing[4]};
  }
`;

const SlideContent = styled.div`
  font-size: ${props => props.theme.fontSizes['2xl']};
  color: ${props => props.theme.colors.gray[700]};
  line-height: 1.6;
  max-width: 800px;
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.lg};
    max-width: 100%;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.colors.secondary};
    margin-bottom: ${props => props.theme.spacing[4]};
  }

  h2 {
    font-size: ${props => props.theme.fontSizes['4xl']};
  }

  h3 {
    font-size: ${props => props.theme.fontSizes['3xl']};
  }

  p {
    margin-bottom: ${props => props.theme.spacing[4]};
  }

  ul, ol {
    text-align: left;
    margin: ${props => props.theme.spacing[4]} 0;
    padding-left: ${props => props.theme.spacing[8]};
  }

  li {
    margin-bottom: ${props => props.theme.spacing[2]};
    list-style: disc;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: ${props => props.theme.fontSizes['2xl']};
  color: ${props => props.theme.colors.gray[600]};
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: ${props => props.theme.fontSizes.xl};
  color: ${props => props.theme.colors.error};
  text-align: center;
  padding: ${props => props.theme.spacing[4]};
`;

const DisplayPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Fetch slides
  const { data: slides = [], isLoading: slidesLoading, error: slidesError } = useQuery({
    queryKey: ['slides'],
    queryFn: slidesService.getAllSlides,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch fixed content
  const { data: fixedContent = [], isLoading: contentLoading, error: contentError } = useQuery({
    queryKey: ['fixedContent'],
    queryFn: fixedContentService.getAllFixedContent,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle slide rotation
  useEffect(() => {
    if (slides.length === 0) return;

    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;

    const duration = currentSlide.duration * 1000; // Convert to milliseconds
    
    const timeout = setTimeout(() => {
      setCurrentSlideIndex((prevIndex) => 
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [slides, currentSlideIndex]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (slidesLoading || contentLoading) {
    return <LoadingMessage>Carregando dashboard...</LoadingMessage>;
  }

  if (slidesError || contentError) {
    return (
      <ErrorMessage>
        Erro ao carregar o dashboard.<br />
        Verifique a conexão com o servidor.
      </ErrorMessage>
    );
  }

  return (
    <Container>
      <FixedSection>
        <Logo>
          <LogoText>JIMI IOT</LogoText>
          <LogoSubtitle>BRASIL</LogoSubtitle>
        </Logo>

        <DateTime>
          <DateDisplay>{formatDate(currentTime)}</DateDisplay>
          <Time>{formatTime(currentTime)}</Time>
        </DateTime>

        {fixedContent.map((item) => (
          <FixedContentItem key={item.id}>
            <FixedContentTitle>
              {item.type === 'announcement' ? '📢 Aviso' : 
               item.type === 'weather' ? '🌤️ Clima' : 
               item.type === 'kpi' ? '📊 KPIs' : 
               '💡 Informação'}
            </FixedContentTitle>
            <FixedContentText 
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </FixedContentItem>
        ))}
      </FixedSection>

      <DynamicSection>
        {slides.length === 0 ? (
          <SlideContainer $isVisible={true}>
            <SlideTitle>Bem-vindos!</SlideTitle>
            <SlideContent>
              <p>Nenhum slide configurado ainda.</p>
              <p>Entre na área administrativa para adicionar conteúdo.</p>
            </SlideContent>
          </SlideContainer>
        ) : (
          <>
            {slides.map((slide, index) => (
              <SlideContainer 
                key={slide.id} 
                $isVisible={index === currentSlideIndex}
              >
                <SlideTitle>{slide.title}</SlideTitle>
                <SlideContent 
                  dangerouslySetInnerHTML={{ __html: slide.content }}
                />
              </SlideContainer>
            ))}
          </>
        )}
      </DynamicSection>
    </Container>
  );
};

export default DisplayPage;
