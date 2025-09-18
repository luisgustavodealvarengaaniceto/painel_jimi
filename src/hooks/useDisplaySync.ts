import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook personalizado para sincronização em tempo real do display
 * Força a atualização das queries do display para garantir que a TV
 * sempre mostre o conteúdo mais atualizado
 */
export const useDisplaySync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Função para forçar atualização das queries do display
    const forceDisplayUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      queryClient.invalidateQueries({ queryKey: ['fixedContent'] });
    };

    // Listener para mudanças de foco da janela
    const handleFocus = () => {
      forceDisplayUpdate();
    };

    // Listener para mudanças de visibilidade da página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        forceDisplayUpdate();
      }
    };

    // Listener para eventos de storage (quando outra aba faz mudanças)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'display-update-trigger') {
        forceDisplayUpdate();
      }
    };

    // Adicionar listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [queryClient]);

  // Função para trigger manual de atualização
  const triggerDisplayUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['slides'] });
    queryClient.invalidateQueries({ queryKey: ['fixedContent'] });
    
    // Notificar outras abas/janelas
    localStorage.setItem('display-update-trigger', Date.now().toString());
  };

  return { triggerDisplayUpdate };
};

/**
 * Função utilitária para trigger de atualização do display
 * Pode ser usada em componentes que não precisam do hook completo
 */
export const triggerDisplayUpdate = () => {
  // Notificar outras abas/janelas através do localStorage
  localStorage.setItem('display-update-trigger', Date.now().toString());
};
