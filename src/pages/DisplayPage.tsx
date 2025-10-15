import React, { useState, useEffect, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { slidesService } from '../services/slidesService';
import { fixedContentService } from '../services/fixedContentService';
import { useDisplaySync } from '../hooks/useDisplaySync';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useAuth } from '../contexts/AuthContext';
import SlideImages from '../components/SlideImages';
import type { Theme } from '../styles/themes';

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
  padding: ${props => props.theme.spacing[3]};
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    flex: 1;
    padding: ${props => props.theme.spacing[2]};
  }
`;

const Logo = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[4]} 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const LogoImage = styled.img`
  width: 100%;
  max-width: 220px;
  height: auto;
  margin: 0 auto;
  display: block;
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

const FixedContentTitle = styled.h3<{ $fontSize?: number }>`
  font-size: ${props => props.$fontSize ? `${props.$fontSize}px` : props.theme.fontSizes.lg};
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const FixedContentText = styled.div<{ $fontSize?: number }>`
  font-size: ${props => props.$fontSize ? `${props.$fontSize}px` : props.theme.fontSizes.sm};
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;

  /* Estilos para tabelas no conteúdo fixo */
  table {
    width: 100%;
    max-width: 100%;
    border-collapse: collapse;
    margin: ${props => props.theme.spacing[2]} 0;
    background: rgba(255, 255, 255, 0.1);
    font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.85}px` : '0.85em'};
    table-layout: fixed; /* Força largura fixa das colunas */
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  th, td {
    padding: ${props => props.theme.spacing[2]};
    text-align: left;
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
    max-width: 0; /* Força as colunas a se distribuírem igualmente */
    min-width: 60px; /* Largura mínima para legibilidade */
  }

  th {
    background: rgba(255, 255, 255, 0.15);
    font-weight: 600;
    font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.9}px` : '0.9em'};
  }

  tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.05);
  }
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
  padding: ${props => props.theme.spacing[4]};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: translateX(${props => props.$isVisible ? '0' : '100px'});
  overflow-x: hidden; /* Previne scroll horizontal em todo o slide */
  overflow-y: auto; /* Permite scroll vertical se necessário */
  
  /* Container para tabelas grandes - prevenção de overflow */
  table {
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }
  
  /* Prevenção de overflow horizontal global */
  * {
    max-width: 100%;
    box-sizing: border-box;
  }
  transition: all 0.8s ease-in-out;
  overflow-x: hidden; /* Previne scroll horizontal */
  overflow-y: auto; /* Permite scroll vertical */
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[3]};
  }
`;

const SlideTitle = styled.h1<{ $fontSize?: number }>`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: ${props => props.$fontSize ? `${props.$fontSize * 2}px` : props.theme.fontSizes['5xl']};
  font-weight: 700;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing[8]};
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: ${props => props.$fontSize ? `${props.$fontSize * 1.5}px` : props.theme.fontSizes['3xl']};
    margin-bottom: ${props => props.theme.spacing[4]};
  }
`;

const SlideContent = styled.div<{ $fontSize?: number }>`
  font-size: ${props => props.$fontSize ? `${props.$fontSize}px` : props.theme.fontSizes['2xl']};
  color: ${props => props.theme.colors.gray[700]};
  line-height: 1.5;
  width: 100%;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  overflow-x: hidden;
  white-space: pre-wrap; /* Preserva quebras de linha e espaços */
  
  @media (max-width: 768px) {
    font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.85}px` : props.theme.fontSizes.lg};
  }

  /* Garantir que quebras de linha sejam respeitadas */
  br {
    display: block;
    margin: 0.5em 0;
    line-height: 1.2;
  }

  /* Hard breaks do TipTap */
  .hard-break {
    display: block;
    margin: 0.5em 0;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.colors.secondary};
    margin-bottom: ${props => props.theme.spacing[3]};
    word-wrap: break-word;
    white-space: normal; /* Headers podem quebrar normalmente */
  }

  h2 {
    font-size: ${props => props.$fontSize ? `${props.$fontSize * 1.5}px` : props.theme.fontSizes['4xl']};
  }

  h3 {
    font-size: ${props => props.$fontSize ? `${props.$fontSize * 1.3}px` : props.theme.fontSizes['3xl']};
  }

  p {
    margin-bottom: ${props => props.theme.spacing[4]};
    white-space: pre-wrap; /* Preserva quebras de linha dentro dos parágrafos */
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

  /* Estilos para tabelas do Excel */
  table {
    width: 100%;
    max-width: 100%;
    border-collapse: collapse;
    margin: ${props => props.theme.spacing[4]} auto;
    background: ${props => props.theme.colors.white};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: ${props => props.theme.radii.md};
    overflow: hidden;
    table-layout: auto; /* Mudança: volta para auto para permitir ajuste natural */
    font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.85}px` : '0.9em'};
    /* Garante que a tabela nunca ultrapasse o container */
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  thead {
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
    color: ${props => props.theme.colors.white};
  }

  th {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[2]};
    text-align: left;
    font-weight: 600;
    font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.8}px` : '0.85em'};
    border-bottom: 3px solid ${props => props.theme.colors.primary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
    white-space: normal; /* Permite quebra de linha natural */
    min-width: 100px; /* Largura mínima para cabeçalhos */
    vertical-align: top;
  }

  td {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[2]};
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
    font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.75}px` : '0.8em'};
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
    white-space: normal; /* Permite quebra de linha natural */
    min-width: 80px; /* Largura mínima para dados */
    vertical-align: top; /* Alinha conteúdo ao topo da célula */
    line-height: 1.4; /* Melhora legibilidade em texto quebrado */
  }

  tbody tr {
    transition: background-color 0.2s;
  }

  tbody tr:nth-child(even) {
    background-color: ${props => props.theme.colors.gray[50]};
  }

  tbody tr:hover {
    background-color: ${props => props.theme.colors.gray[100]};
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  /* Tabelas sem thead (apenas td) */
  tbody tr:first-child td {
    font-weight: 600;
    background: ${props => props.theme.colors.gray[100]};
    border-bottom: 2px solid ${props => props.theme.colors.gray[300]};
  }

  /* Responsividade para tabelas em TVs e monitores grandes */
  @media (min-width: 1200px) {
    table {
      font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.9}px` : '1rem'};
      table-layout: auto; /* Permite ajuste natural das colunas */
    }
    
    th {
      min-width: 120px;
      font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.85}px` : '0.9rem'};
      padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[3]};
    }
    
    td {
      min-width: 100px;
      font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.8}px` : '0.85rem'};
      padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    }
  }

  /* Responsividade para tablets e telas médias */
  @media (max-width: 1199px) and (min-width: 768px) {
    table {
      font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.8}px` : '0.85rem'};
      table-layout: fixed; /* Força distribuição igual em telas médias */
    }
    
    th, td {
      padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
      min-width: 80px;
      font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.7}px` : '0.75rem'};
      max-width: 0; /* Força distribuição igual */
    }
  }

  /* Responsividade para telas pequenas */
  @media (max-width: 767px) {
    table {
      font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.7}px` : '0.75rem'};
      table-layout: fixed; /* Força distribuição igual em telas pequenas */
    }
    
    th, td {
      padding: ${props => props.theme.spacing[1]};
      min-width: 60px;
      max-width: 0; /* Força distribuição igual */
      font-size: ${props => props.$fontSize ? `${props.$fontSize * 0.65}px` : '0.7rem'};
    }
    
    th {
      text-transform: none; /* Remove caps em telas pequenas */
      letter-spacing: normal;
    }
  }

  /* Proteção extra para tabelas muito largas em dispositivos pequenos */
  @media (max-width: 480px) {
    table {
      table-layout: fixed;
      width: 100%;
    }
    
    th, td {
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 0;
      white-space: nowrap;
    }
    
    /* Permite expansão ao hover/touch */
    th:hover, td:hover,
    th:focus, td:focus {
      white-space: normal;
      overflow: visible;
      position: relative;
      z-index: 10;
      background: ${props => props.theme.colors.white};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
`;

const SlideContentWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform-origin: center center;
  transition: transform 0.3s ease-out;
  overflow-x: hidden; /* Proteção extra contra overflow horizontal */
  box-sizing: border-box;
  
  /* Garante que todo conteúdo interno respeite a largura máxima */
  * {
    max-width: 100%;
    box-sizing: border-box;
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
// Component for individual slide with auto-scroll
interface SlideWithAutoScrollProps {
  slide: any;
  isVisible: boolean;
  index: number;
  slideRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  isAuthReady: boolean; // Indica se a autenticação está pronta
}

const SlideWithAutoScroll: React.FC<SlideWithAutoScrollProps> = React.memo(({ 
  slide, 
  isVisible, 
  index, 
  slideRefs,
  isAuthReady
}) => {
  const autoScrollRef = useAutoScroll({
    duration: slide.duration * 1000, // Convert seconds to milliseconds
    isActive: isVisible,
    resetTrigger: isVisible ? slide.id : null
  });

  return (
    <SlideContainer $isVisible={isVisible}>
      <SlideContentWrapper 
        ref={(el) => {
          slideRefs.current[index] = el;
        }}
      >
        <SlideTitle $fontSize={slide.fontSize}>
          {slide.title}
        </SlideTitle>
        <SlideContent 
          ref={autoScrollRef}
          $fontSize={slide.fontSize}
          dangerouslySetInnerHTML={{ __html: slide.content }}
        />
        <SlideImages slideId={slide.id} enabled={isAuthReady} />
      </SlideContentWrapper>
    </SlideContainer>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.slide.id === nextProps.slide.id &&
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.isAuthReady === nextProps.isAuthReady &&
    prevProps.index === nextProps.index
  );
});

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
  const theme = useTheme() as Theme;
  const { user, isLoading: authLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Autenticação está pronta quando não está mais carregando
  const isAuthReady = !authLoading;

  // Get brand info from theme
  const brandName = theme.brand || 'JIMI IOT BRASIL';
  const themeName = theme.name || 'default';
  const brandParts = brandName.split(' ');
  const brandMain = brandParts.slice(0, 2).join(' ') || 'JIMI IOT';
  const brandSub = brandParts.slice(2).join(' ') || 'BRASIL';
  
  // Check if it's Akroz Group theme to show logo instead of text
  const isAkrozTheme = themeName === 'akroz';

  // Initialize display sync for real-time updates
  useDisplaySync();

  // Fetch slides with aggressive refreshing for TV display
  const { data: slides = [], isLoading: slidesLoading, error: slidesError, dataUpdatedAt } = useQuery({
    queryKey: ['slides', user?.tenant],
    queryFn: slidesService.getAllSlides,
    refetchInterval: 5000, // Refetch every 5 seconds for TV display
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on component mount
    staleTime: 0, // Consider data immediately stale
    gcTime: 1000 * 60, // Keep in cache for 1 minute
  });

  // Fetch fixed content with aggressive refreshing
  const { data: fixedContent = [], isLoading: contentLoading, error: contentError, dataUpdatedAt: fixedContentUpdatedAt } = useQuery({
    queryKey: ['fixedContent', user?.tenant],
    queryFn: fixedContentService.getAllFixedContent,
    refetchInterval: 5000, // Refetch every 5 seconds for TV display
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on component mount
    staleTime: 0, // Consider data immediately stale
    gcTime: 1000 * 60, // Keep in cache for 1 minute
  });

  // Update last update time when data changes
  useEffect(() => {
    const latestUpdate = Math.max(dataUpdatedAt || 0, fixedContentUpdatedAt || 0);
    if (latestUpdate > 0) {
      setLastUpdate(new Date(latestUpdate));
    }
  }, [dataUpdatedAt, fixedContentUpdatedAt]);

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

  // Auto-scaling effect for slide content
  useEffect(() => {
    if (slides.length === 0 || !containerRef.current) return;

    const currentSlideRef = slideRefs.current[currentSlideIndex];
    if (!currentSlideRef) return;

    const container = containerRef.current;
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;

    // Wait for content to render
    const timeoutId = setTimeout(() => {
      const contentHeight = currentSlideRef.scrollHeight;
      const contentWidth = currentSlideRef.scrollWidth;

      // Calculate scale factors
      const scaleY = contentHeight > containerHeight ? containerHeight / contentHeight : 1;
      const scaleX = contentWidth > containerWidth ? containerWidth / contentWidth : 1;
      const scale = Math.min(scaleY, scaleX, 1); // Never scale up, only down

      // Apply scale with slight padding (95% to ensure margin)
      if (scale < 1) {
        currentSlideRef.style.transform = `scale(${scale * 0.95})`;
      } else {
        currentSlideRef.style.transform = 'scale(1)';
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentSlideIndex, slides]);

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
          {isAkrozTheme ? (
            <LogoImage 
              src="/logos/logo-akroz-group-alinhamento-base-horiz.png"
              alt="Akroz Group"
            />
          ) : (
            <>
              <LogoText>{brandMain}</LogoText>
              <LogoSubtitle>{brandSub}</LogoSubtitle>
            </>
          )}
        </Logo>

        <DateTime>
          <DateDisplay>{formatDate(currentTime)}</DateDisplay>
          <Time>{formatTime(currentTime)}</Time>
        </DateTime>

        {fixedContent.map((item) => (
          <FixedContentItem key={item.id}>
            <FixedContentTitle $fontSize={item.fontSize}>
              {item.type === 'announcement' ? '📢 Aviso' : 
               item.type === 'weather' ? '🌤️ Clima' : 
               item.type === 'kpi' ? '📊 KPIs' : 
               '💡 Informação'}
            </FixedContentTitle>
            <FixedContentText 
              $fontSize={item.fontSize}
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </FixedContentItem>
        ))}
        
        {/* Status indicator for last update */}
        <FixedContentItem style={{ fontSize: '12px', opacity: 0.7, marginTop: 'auto' }}>
          <div>🔄 Última atualização:</div>
          <div>{lastUpdate.toLocaleTimeString('pt-BR')}</div>
        </FixedContentItem>
      </FixedSection>

      <DynamicSection ref={containerRef}>
        {slides.length === 0 ? (
          <SlideContainer $isVisible={true}>
            <SlideContentWrapper>
              <SlideTitle>Bem-vindos!</SlideTitle>
              <SlideContent>
                <p>Nenhum slide configurado ainda.</p>
                <p>Entre na área administrativa para adicionar conteúdo.</p>
              </SlideContent>
            </SlideContentWrapper>
          </SlideContainer>
        ) : (
          <>
            {slides.map((slide, index) => (
              <SlideWithAutoScroll
                key={slide.id}
                slide={slide}
                isVisible={index === currentSlideIndex}
                index={index}
                slideRefs={slideRefs}
                isAuthReady={isAuthReady}
              />
            ))}
          </>
        )}
      </DynamicSection>
    </Container>
  );
};

export default DisplayPage;
