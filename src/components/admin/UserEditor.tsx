import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/usersService';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../types';
import { Save, X, Shield, Eye } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing[4]};
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[6]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.white};
  cursor: pointer;
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.md};
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Form = styled.form`
  padding: ${props => props.theme.spacing[6]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[6]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.colors.gray[700]};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.base};
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const RoleSelection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[3]};
`;

const RoleOption = styled.div<{ selected: boolean }>`
  border: 2px solid ${props => 
    props.selected ? props.theme.colors.primary : props.theme.colors.gray[200]
  };
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing[4]};
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  background: ${props => 
    props.selected ? props.theme.colors.primary : props.theme.colors.white
  };
  color: ${props => 
    props.selected ? props.theme.colors.white : props.theme.colors.gray[700]
  };

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const RoleIcon = styled.div`
  font-size: ${props => props.theme.fontSizes['2xl']};
  margin-bottom: ${props => props.theme.spacing[2]};
  display: flex;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const RoleTitle = styled.div`
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const RoleDescription = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  opacity: 0.8;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing[3]};
  padding-top: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${props => 
    props.$variant === 'primary' ? props.theme.colors.primary : props.theme.colors.gray[500]
  };
  color: ${props => props.theme.colors.white};
  border: none;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.radii.md};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const HelperText = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[600]};
  margin: 0;
`;

interface UserEditorProps {
  user?: User;
  onClose: () => void;
}

const UserEditor: React.FC<UserEditorProps> = ({ user, onClose }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'VIEWER'>(user?.role || 'VIEWER');
  const [error, setError] = useState('');

  const queryClient = useQueryClient();
  const isEditing = !!user;

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao criar usuário');
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => 
      usersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao atualizar usuário');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Nome de usuário é obrigatório');
      return;
    }

    if (!isEditing && !password.trim()) {
      setError('Senha é obrigatória');
      return;
    }

    if (password && password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    const userData: any = {
      username: username.trim(),
      role,
    };

    if (password) {
      userData.password = password;
    }

    try {
      if (isEditing && user) {
        await updateMutation.mutateAsync({ id: user.id, data: userData });
      } else {
        await createMutation.mutateAsync(userData);
      }
    } catch (error) {
      // Error is handled in the mutation's onError
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal>
        <Header>
          <Title>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</Title>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="username">Nome de Usuário *</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite o nome de usuário"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">
              {isEditing ? 'Nova Senha (deixe vazio para manter atual)' : 'Senha *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? 'Digite nova senha (opcional)' : 'Digite a senha'}
              required={!isEditing}
            />
            {!isEditing && (
              <HelperText>
                A senha deve ter pelo menos 6 caracteres
              </HelperText>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Nível de Acesso *</Label>
            <RoleSelection>
              <RoleOption 
                selected={role === 'VIEWER'}
                onClick={() => setRole('VIEWER')}
              >
                <RoleIcon>
                  <Eye />
                </RoleIcon>
                <RoleTitle>Visualizador</RoleTitle>
                <RoleDescription>
                  Pode apenas visualizar o dashboard
                </RoleDescription>
              </RoleOption>

              <RoleOption 
                selected={role === 'ADMIN'}
                onClick={() => setRole('ADMIN')}
              >
                <RoleIcon>
                  <Shield />
                </RoleIcon>
                <RoleTitle>Administrador</RoleTitle>
                <RoleDescription>
                  Pode gerenciar todo o sistema
                </RoleDescription>
              </RoleOption>
            </RoleSelection>
          </FormGroup>

          <Actions>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading}>
              <Save />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default UserEditor;
