import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SlidesManager from '../components/admin/SlidesManager';
import SlideEditor from '../components/admin/SlideEditor';
import FixedContentManager from '../components/admin/FixedContentManager';
import FixedContentEditor from '../components/admin/FixedContentEditor';
import UsersManager from '../components/admin/UsersManager';
import UserEditor from '../components/admin/UserEditor';
import SettingsManager from '../components/admin/SettingsManager';
import ArchivedSlidesViewer from '../components/admin/ArchivedSlidesViewer';
import type { Slide, FixedContent, User } from '../types';
import type { Theme } from '../styles/themes';

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: ${props => props.theme.colors.background};
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const Header = styled.header`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${props => props.theme.shadows.sm};
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[4]};
  width: 100%;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Logo = styled.h1`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.xl};
  }
  
  @media (max-width: 480px) {
    font-size: ${props => props.theme.fontSizes.lg};
  }
`;

const Navigation = styled.nav`
  background: ${props => props.theme.colors.white};
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
  padding: 0 ${props => props.theme.spacing[6]};
  overflow-x: auto;
  width: 100%;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 0 ${props => props.theme.spacing[4]};
  }
`;

const NavList = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  min-width: fit-content;
`;

const NavItem = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.gray[700]};
  border: none;
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: ${props => props.theme.radii.md} ${props => props.theme.radii.md} 0 0;
  white-space: nowrap;
  font-size: ${props => props.theme.fontSizes.sm};

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.gray[100]};
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    font-size: ${props => props.theme.fontSizes.xs};
  }
`;

const UserInfo2 = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: ${props => props.theme.spacing[2]};
    width: 100%;
    justify-content: space-between;
  }
`;

const UserName = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.gray[700]};
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.sm};
  }
`;

const Button = styled.button`
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;

  &:hover {
    background: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    font-size: ${props => props.theme.fontSizes.xs};
  }
`;

const ClearCacheButton = styled(Button)`
  background: ${props => props.theme.colors.gray[600]};
  margin-right: ${props => props.theme.spacing[2]};

  &:hover {
    background: ${props => props.theme.colors.gray[700]};
  }
  
  @media (max-width: 768px) {
    margin-right: ${props => props.theme.spacing[1]};
    margin-bottom: ${props => props.theme.spacing[2]};
  }
`;

const ViewDisplayButton = styled(Button)`
  background: ${props => props.theme.colors.primary};
  margin-right: ${props => props.theme.spacing[2]};

  &:hover {
    background: ${props => props.theme.colors.secondary};
  }
  
  @media (max-width: 768px) {
    margin-right: ${props => props.theme.spacing[1]};
    margin-bottom: ${props => props.theme.spacing[2]};
  }
`;

const Content = styled.main`
  padding: ${props => props.theme.spacing[8]};
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  overflow-y: auto;
  
  @media (max-width: 1440px) {
    max-width: 100%;
    padding: ${props => props.theme.spacing[6]};
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[4]};
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing[3]};
  }
`;

const WelcomeBox = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[8]};
  border-radius: ${props => props.theme.radii.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[8]};
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[6]};
    margin-bottom: ${props => props.theme.spacing[6]};
  }
`;

const WelcomeTitle = styled.h2`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: ${props => props.theme.fontSizes['3xl']};
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes['2xl']};
  }
  
  @media (max-width: 480px) {
    font-size: ${props => props.theme.fontSizes.xl};
  }
`;

const WelcomeText = styled.p`
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.gray[600]};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.fontSizes.base};
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing[6]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[4]};
  }
  
  @media (max-width: 320px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const FeatureCard = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.md};
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const FeatureIcon = styled.div`
  font-size: ${props => props.theme.fontSizes['4xl']};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const FeatureTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  line-height: 1.5;
`;

const AdminPage: React.FC = () => {
  const { user, logout, clearCache } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme() as Theme;
  const brandName = theme.brand || 'JIMI IOT BRASIL';
  const brandFull = brandName;
  const [currentView, setCurrentView] = useState<'overview' | 'slides' | 'content' | 'users' | 'settings' | 'archived'>('overview');
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isCreatingSlide, setIsCreatingSlide] = useState(false);
  const [editingContent, setEditingContent] = useState<FixedContent | null>(null);
  const [isCreatingContent, setIsCreatingContent] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewDisplay = () => {
    navigate('/display');
  };

  const handleClearCache = () => {
    clearCache();
    alert('Cache limpo com sucesso!');
  };

  return (
    <Container>
      <Header>
        <Logo>{brandFull} - Painel Administrativo</Logo>
        <UserInfo2>
          <UserName>Olá, {user?.username}! ({user?.tenant})</UserName>
          <ClearCacheButton onClick={handleClearCache}>
            🗑️ Limpar Cache
          </ClearCacheButton>
          <ViewDisplayButton onClick={handleViewDisplay}>
            Ver Display
          </ViewDisplayButton>
          <Button onClick={handleLogout}>
            Sair
          </Button>
        </UserInfo2>
      </Header>

      <Navigation>
        <NavList>
          <NavItem 
            $active={currentView === 'overview'} 
            onClick={() => setCurrentView('overview')}
          >
            📊 Visão Geral
          </NavItem>
          <NavItem 
            $active={currentView === 'slides'} 
            onClick={() => setCurrentView('slides')}
          >
            🎞️ Slides
          </NavItem>
          <NavItem 
            $active={currentView === 'archived'} 
            onClick={() => setCurrentView('archived')}
          >
            📦 Arquivados
          </NavItem>
          <NavItem 
            $active={currentView === 'content'} 
            onClick={() => setCurrentView('content')}
          >
            📌 Conteúdo Fixo
          </NavItem>
          <NavItem 
            $active={currentView === 'users'} 
            onClick={() => setCurrentView('users')}
          >
            👥 Usuários
          </NavItem>
          <NavItem 
            $active={currentView === 'settings'} 
            onClick={() => setCurrentView('settings')}
          >
            ⚙️ Configurações
          </NavItem>
        </NavList>
      </Navigation>

      <Content>
        {currentView === 'overview' && (
          <>
            <WelcomeBox>
              <WelcomeTitle>Bem-vindo ao Painel Administrativo</WelcomeTitle>
              <WelcomeText>
                Gerencie o conteúdo do dashboard da {brandFull}.<br />
                Configure slides, conteúdo fixo e monitore as exibições.
              </WelcomeText>
            </WelcomeBox>

            <FeatureGrid>
              <FeatureCard onClick={() => setCurrentView('slides')}>
                <FeatureIcon>📊</FeatureIcon>
                <FeatureTitle>Gerenciar Slides</FeatureTitle>
                <FeatureDescription>
                  Crie, edite e organize os slides que serão exibidos na seção dinâmica do dashboard.
                  Configure títulos, conteúdo e duração de cada slide.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard onClick={() => setCurrentView('content')}>
                <FeatureIcon>📌</FeatureIcon>
                <FeatureTitle>Conteúdo Fixo</FeatureTitle>
                <FeatureDescription>
                  Gerencie o conteúdo que aparece na seção fixa do dashboard, como avisos importantes,
                  KPIs e informações permanentes.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard onClick={() => setCurrentView('users')}>
                <FeatureIcon>👥</FeatureIcon>
                <FeatureTitle>Usuários</FeatureTitle>
                <FeatureDescription>
                  Gerencie usuários do sistema, crie novos logins para visualização e administração
                  do dashboard.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard onClick={() => setCurrentView('settings')}>
                <FeatureIcon>⚙️</FeatureIcon>
                <FeatureTitle>Configurações</FeatureTitle>
                <FeatureDescription>
                  Configure parâmetros do sistema, intervalos de atualização, temas e outras
                  configurações avançadas.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
          </>
        )}

        {currentView === 'slides' && (
          <SlidesManager
            onCreateSlide={() => setIsCreatingSlide(true)}
            onEditSlide={(slide) => setEditingSlide(slide)}
          />
        )}

        {currentView === 'archived' && (
          <ArchivedSlidesViewer />
        )}

        {currentView === 'content' && (
          <FixedContentManager
            onCreateContent={() => setIsCreatingContent(true)}
            onEditContent={(content) => setEditingContent(content)}
          />
        )}

        {currentView === 'users' && (
          <UsersManager
            onCreateUser={() => setIsCreatingUser(true)}
            onEditUser={(user) => setEditingUser(user)}
            currentUserId={user?.id || ''}
          />
        )}

        {currentView === 'settings' && (
          <SettingsManager />
        )}
      </Content>

      {/* Modals */}
      {(isCreatingSlide || editingSlide) && (
        <SlideEditor
          slide={editingSlide || undefined}
          onClose={() => {
            setIsCreatingSlide(false);
            setEditingSlide(null);
          }}
        />
      )}

      {(isCreatingContent || editingContent) && (
        <FixedContentEditor
          content={editingContent || undefined}
          onClose={() => {
            setIsCreatingContent(false);
            setEditingContent(null);
          }}
        />
      )}

      {(isCreatingUser || editingUser) && (
        <UserEditor
          user={editingUser || undefined}
          onClose={() => {
            setIsCreatingUser(false);
            setEditingUser(null);
          }}
        />
      )}
    </Container>
  );
};

export default AdminPage;
