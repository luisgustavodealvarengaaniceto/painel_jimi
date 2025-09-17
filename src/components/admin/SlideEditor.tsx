import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { slidesService } from '../../services/slidesService';
import type { Slide, CreateSlideRequest, UpdateSlideRequest } from '../../types';
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
  max-width: 800px;
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

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.fontSizes.base};
  font-family: inherit;
  min-height: 200px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[4]};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
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
  accent-color: ${props => props.theme.colors.primary};
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

interface SlideEditorProps {
  slide?: Slide;
  onClose: () => void;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ slide, onClose }) => {
  const [title, setTitle] = useState(slide?.title || '');
  const [content, setContent] = useState(slide?.content || '');
  const [duration, setDuration] = useState(slide?.duration || 10);
  const [order, setOrder] = useState(slide?.order || 0);
  const [isActive, setIsActive] = useState(slide?.isActive ?? true);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();
  const isEditing = !!slide;

  // Create slide mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSlideRequest) => slidesService.createSlide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slides'] });
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao criar slide');
    },
  });

  // Update slide mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlideRequest }) => 
      slidesService.updateSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slides'] });
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao atualizar slide');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Título e conteúdo são obrigatórios');
      return;
    }

    const slideData = {
      title: title.trim(),
      content: content.trim(),
      duration: Number(duration),
      order: Number(order),
      isActive,
    };

    try {
      if (isEditing && slide) {
        await updateMutation.mutateAsync({ id: slide.id, data: slideData });
      } else {
        await createMutation.mutateAsync(slideData);
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
          <Title>{isEditing ? 'Editar Slide' : 'Novo Slide'}</Title>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do slide"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="content">Conteúdo *</Label>
            <TextArea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do slide (HTML básico é suportado)"
              required
            />
            <HelperText>
              Você pode usar HTML básico como &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.
            </HelperText>
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="300"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
              <HelperText>Tempo de exibição do slide (5-300 segundos)</HelperText>
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
              <HelperText>Ordem de exibição (0 = primeiro)</HelperText>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <CheckboxGroup>
              <Checkbox
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <Label htmlFor="isActive">Slide ativo</Label>
            </CheckboxGroup>
            <HelperText>Slides inativos não serão exibidos no dashboard</HelperText>
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

export default SlideEditor;
