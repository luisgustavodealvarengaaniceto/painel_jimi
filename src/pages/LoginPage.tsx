import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  padding: ${props => props.theme.spacing[4]};
`;

const LoginBox = styled.div`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[10]};
  border-radius: ${props => props.theme.radii.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[8]};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoText = styled.h1`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[6]};
  width: 100%;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  width: 100%;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.colors.gray[700]};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.lg};
  font-size: ${props => props.theme.fontSizes.base};
  transition: border-color 0.2s;
  width: 100%;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }

  &:invalid {
    border-color: ${props => props.theme.colors.error};
  }
`;

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.radii.lg};
  font-size: ${props => props.theme.fontSizes.base};
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  width: 100%;

  &:hover {
    background: ${props => props.theme.colors.secondary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.sm};
  text-align: center;
`;

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/display'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <LoginBox>
        <Logo>
          <LogoText>JIMI IOT BRASIL</LogoText>
          <Subtitle>Dashboard de Informações</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <InputGroup>
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Digite seu usuário"
              autoComplete="username"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </InputGroup>

          <Button type="submit" disabled={isLoading || !username || !password}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>
      </LoginBox>
    </Container>
  );
};

export default LoginPage;
