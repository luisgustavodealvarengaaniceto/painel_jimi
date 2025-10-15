import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.white};
`;

const Spinner = styled.div`
  border: 4px solid ${props => props.theme.colors.gray[300]};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const Message = styled.p`
  margin-top: ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.gray[400]};
`;

const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => {
  return (
    <Container>
      <Spinner />
      <Message>{message}</Message>
    </Container>
  );
};

export default LoadingScreen;
