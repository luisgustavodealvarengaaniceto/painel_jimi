import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 2rem;
  text-align: center;
  background: #f5f5f5;
`;

const ErrorTitle = styled.h1`
  color: #e74c3c;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.5;
`;

const ReloadButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #2980b9;
  }
`;

const ErrorDetails = styled.details`
  margin-top: 2rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-width: 800px;
  text-align: left;

  summary {
    cursor: pointer;
    font-weight: bold;
    color: #666;
  }

  pre {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f8f8;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.9rem;
    white-space: pre-wrap;
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] Erro capturado:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Erro detalhado:', error, errorInfo);
  }

  handleReload = () => {
    console.log('[ErrorBoundary] Recarregando página...');
    window.location.reload();
  };

  handleGoHome = () => {
    console.log('[ErrorBoundary] Redirecionando para home...');
    // Clear local storage and go to login
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Oops! Algo deu errado</ErrorTitle>
          <ErrorMessage>
            A aplicação encontrou um erro inesperado. Isso pode acontecer quando você 
            atualiza a página (F5) ou há algum problema de cache. Tente recarregar 
            a página ou fazer login novamente.
          </ErrorMessage>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <ReloadButton onClick={this.handleReload}>
              🔄 Recarregar Página
            </ReloadButton>
            <ReloadButton onClick={this.handleGoHome} style={{ background: '#e74c3c' }}>
              🏠 Ir para Login
            </ReloadButton>
          </div>

          <ErrorDetails>
            <summary>Detalhes do erro (para desenvolvedores)</summary>
            <pre>
              {this.state.error?.name}: {this.state.error?.message}
              {'\n\n'}
              Stack Trace:
              {this.state.error?.stack}
            </pre>
          </ErrorDetails>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;