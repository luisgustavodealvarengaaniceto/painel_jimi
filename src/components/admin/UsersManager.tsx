import React from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/usersService';
import type { User } from '../../types';
import { Edit, Trash2, Plus, Shield, Eye } from 'lucide-react';

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

const UserGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
`;

const UserCard = styled.div`
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[4]};
`;

const UserAvatar = styled.div<{ role: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => 
    props.role === 'ADMIN' ? props.theme.colors.primary : props.theme.colors.secondary
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.white};
  font-weight: 600;
  font-size: ${props => props.theme.fontSizes.lg};
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  margin: 0 0 ${props => props.theme.spacing[1]} 0;
`;

const UserRole = styled.div<{ role: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  background: ${props => 
    props.role === 'ADMIN' ? props.theme.colors.primary : props.theme.colors.secondary
  };
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.base};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: 500;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const UserDate = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin-top: ${props => props.theme.spacing[1]};
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

interface UsersManagerProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
  currentUserId: string;
}

const UsersManager: React.FC<UsersManagerProps> = ({ 
  onCreateUser, 
  onEditUser, 
  currentUserId 
}) => {
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: usersService.getAllUsers,
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Erro ao excluir usuário');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>Gerenciar Usuários</Title>
        </Header>
        <LoadingMessage>Carregando usuários...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Gerenciar Usuários</Title>
        </Header>
        <ErrorMessage>Erro ao carregar usuários</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gerenciar Usuários</Title>
        <AddButton onClick={onCreateUser}>
          <Plus />
          Novo Usuário
        </AddButton>
      </Header>
      
      <Content>
        {users.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>👥</EmptyStateIcon>
            <EmptyStateText>Nenhum usuário encontrado</EmptyStateText>
            <AddButton onClick={onCreateUser}>
              <Plus />
              Criar Primeiro Usuário
            </AddButton>
          </EmptyState>
        ) : (
          <UserGrid>
            {users.map((user) => (
              <UserCard key={user.id}>
                <UserInfo>
                  <UserAvatar role={user.role}>
                    {getUserInitials(user.username)}
                  </UserAvatar>
                  <UserDetails>
                    <UserName>{user.username}</UserName>
                    <UserRole role={user.role}>
                      {user.role === 'ADMIN' ? <Shield /> : <Eye />}
                      {user.role === 'ADMIN' ? 'Administrador' : 'Visualizador'}
                    </UserRole>
                    <UserDate>
                      Criado em {formatDate(user.createdAt)}
                    </UserDate>
                  </UserDetails>
                </UserInfo>
                
                <Actions>
                  <ActionButton 
                    $variant="primary" 
                    onClick={() => onEditUser(user)}
                    title="Editar usuário"
                  >
                    <Edit />
                  </ActionButton>
                  <ActionButton 
                    $variant="danger" 
                    onClick={() => handleDeleteUser(user.id)}
                    title="Excluir usuário"
                    disabled={user.id === currentUserId}
                  >
                    <Trash2 />
                  </ActionButton>
                </Actions>
              </UserCard>
            ))}
          </UserGrid>
        )}
      </Content>
    </Container>
  );
};

export default UsersManager;
