import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

// Fundo da página em cinza claro
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #F4F6F8;
  font-family: 'Montserrat', sans-serif;
  padding: 20px;
`;

// Card flutuante branco centralizado com sombra profissional
const LoginCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 450px;
  padding: 40px;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

// Logo da Akroz Group com destaque máximo
const Logo = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  margin-bottom: 24px;
  object-fit: contain;
  
  /* Tratamento de erro: esconder se não carregar */
  &[alt]:after {
    content: attr(alt);
    display: block;
    text-align: center;
    color: #999;
    font-size: 14px;
  }
`;

// Título "Akroz Group" em cinza escuro
const Title = styled.h2`
  color: #333333;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 32px 0;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
`;

// Formulário com espaçamento adequado
const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// Grupo de campo (label + input)
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Label em cinza médio
const Label = styled.label`
  color: #555555;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
`;

// Input com borda cinza clara e focus roxo
const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  color: #333333;
  font-size: 16px;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;

  &::placeholder {
    color: #999999;
    font-family: 'Montserrat', sans-serif;
  }

  &:focus {
    outline: none;
    border-color: #6A1DF2;
    box-shadow: 0 0 0 3px rgba(106, 29, 242, 0.1);
  }

  &:hover:not(:focus) {
    border-color: #BBBBBB;
  }
`;

// Botão roxo com hover escurecido e transição suave
const Button = styled.button`
  width: 100%;
  padding: 14px 16px;
  background-color: #6A1DF2;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
    background-color: #5A1ADF;
  }

  &:active:not(:disabled) {
    background-color: #4A15C9;
  }

  &:disabled {
    background-color: #CCCCCC;
    cursor: not-allowed;
  }
`;

// Mensagem de erro elegante
const ErrorMessage = styled.div`
  color: #DC3545;
  background: #FFF5F5;
  border: 1px solid #FED7D7;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
`;

const AkrozLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      // Redirect based on user role will be handled by ProtectedRoute
      navigate('/admin');
    } catch (err) {
      setError('Usuário ou senha inválidos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <LoginCard>
        <Logo 
          src="/logos/logo-akroz-group-alinhamento-base-horiz.png" 
          alt="Akroz Group Logo"
        />
        <Title>Akroz Group</Title>
        
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <FormGroup>
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </FormGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>
      </LoginCard>
    </PageContainer>
  );
};

export default AkrozLoginPage;
