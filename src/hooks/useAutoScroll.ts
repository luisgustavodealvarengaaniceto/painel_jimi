import { useEffect, useRef, useCallback } from 'react';

interface UseAutoScrollOptions {
  duration: number; // Duration in milliseconds
  isActive: boolean; // Whether this slide is currently active
  resetTrigger: any; // Trigger to reset scroll (usually slide index)
}

export const useAutoScroll = ({ duration, isActive, resetTrigger }: UseAutoScrollOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    startTimeRef.current = undefined;
  }, []);

  const resetScroll = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    if (!isActive || !containerRef.current) {
      stopAnimation();
      return;
    }

    const container = containerRef.current;
    const containerHeight = container.clientHeight;
    const contentHeight = container.scrollHeight;
    
    // If content doesn't need scrolling, do nothing
    if (contentHeight <= containerHeight) {
      resetScroll();
      return;
    }

    const maxScrollTop = contentHeight - containerHeight;

    // Reset scroll position
    resetScroll();

    // Start auto-scroll animation
    const startAnimation = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function (ease-in-out)
      const easeInOut = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      if (container) {
        container.scrollTop = maxScrollTop * easeInOut;
      }

      if (progress < 1 && isActive) {
        animationRef.current = requestAnimationFrame(startAnimation);
      } else {
        stopAnimation();
      }
    };

    // Start the animation with a small delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      if (isActive && containerRef.current) {
        animationRef.current = requestAnimationFrame(startAnimation);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      stopAnimation();
    };
  }, [duration, isActive, resetTrigger, stopAnimation, resetScroll]);

  // Reset animation when slide changes
  useEffect(() => {
    if (!isActive) {
      stopAnimation();
      resetScroll();
    }
  }, [resetTrigger, isActive, stopAnimation, resetScroll]);

  return containerRef;
};