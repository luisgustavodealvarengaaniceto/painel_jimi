import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fixedContentService } from '../../services/fixedContentService';
import type { FixedContent, CreateFixedContentRequest, UpdateFixedContentRequest } from '../../types';
import { Save, X } from 'lucide-react';

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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  background: ${props => props.theme.colors.secondary};
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

const Select = styled.select`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.base};
  background: ${props => props.theme.colors.white};
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.secondary};
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.base};
  font-family: inherit;
  min-height: 150px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.secondary};
    outline: none;
  }
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.base};
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.secondary};
    outline: none;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${props => props.theme.colors.secondary};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing[3]};
  padding-top: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => 
    props.variant === 'primary' ? props.theme.colors.secondary : props.theme.colors.gray[500]
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

interface FixedContentEditorProps {
  content?: FixedContent;
  onClose: () => void;
}

const FixedContentEditor: React.FC<FixedContentEditorProps> = ({ content, onClose }) => {
  const [type, setType] = useState(content?.type || 'announcement');
  const [contentText, setContentText] = useState(content?.content || '');
  const [order, setOrder] = useState(content?.order || 0);
  const [isActive, setIsActive] = useState(content?.isActive ?? true);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();
  const isEditing = !!content;

  // Create content mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateFixedContentRequest) => fixedContentService.createFixedContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fixed-content'] });
      queryClient.invalidateQueries({ queryKey: ['fixedContent'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao criar conteúdo');
    },
  });

  // Update content mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFixedContentRequest }) => 
      fixedContentService.updateFixedContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fixed-content'] });
      queryClient.invalidateQueries({ queryKey: ['fixedContent'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao atualizar conteúdo');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!contentText.trim()) {
      setError('Conteúdo é obrigatório');
      return;
    }

    const contentData = {
      type,
      content: contentText.trim(),
      order: Number(order),
      isActive,
    };

    try {
      if (isEditing && content) {
        await updateMutation.mutateAsync({ id: content.id, data: contentData });
      } else {
        await createMutation.mutateAsync(contentData);
      }
    } catch (error) {
      // Error is handled in the mutation's onError
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const contentTypes = [
    { value: 'logo', label: '🏢 Logo' },
    { value: 'datetime', label: '📅 Data/Hora' },
    { value: 'announcement', label: '📢 Aviso' },
    { value: 'weather', label: '🌤️ Clima' },
    { value: 'kpi', label: '📊 KPI' },
  ];

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal>
        <Header>
          <Title>{isEditing ? 'Editar Conteúdo' : 'Novo Conteúdo'}</Title>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="type">Tipo de Conteúdo</Label>
            <Select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {contentTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <HelperText>
              Selecione o tipo de conteúdo para melhor organização
            </HelperText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="content">Conteúdo *</Label>
            <TextArea
              id="content"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Digite o conteúdo (HTML básico é suportado)"
              required
            />
            <HelperText>
              Você pode usar HTML básico como &lt;p&gt;, &lt;strong&gt;, &lt;br&gt;, etc.
            </HelperText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="order">Ordem</Label>
            <Input
              id="order"
              type="number"
              min="0"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
            <HelperText>Ordem de exibição na seção fixa (0 = primeiro)</HelperText>
          </FormGroup>

          <FormGroup>
            <CheckboxGroup>
              <Checkbox
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <Label htmlFor="isActive">Conteúdo ativo</Label>
            </CheckboxGroup>
            <HelperText>Conteúdo inativo não será exibido no dashboard</HelperText>
          </FormGroup>

          <Actions>
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              <Save />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default FixedContentEditor;
