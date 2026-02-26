'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGatekeeper } from '@/context/GatekeeperContext';

/**
 * Listen to DeviceOrientation events and dispatch smoothed data to context.
 * Includes fallback auto-orbit when gyroscope is unavailable.
 */
export function useGyroscope(enabled: boolean) {
  const { dispatch } = useGatekeeper();
  const targetRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const currentRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const hasEventsRef = useRef(false);
  const rafRef = useRef<number>(0);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    hasEventsRef.current = true;
    targetRef.current = {
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0,
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('deviceorientation', handleOrientation);

    // Smooth interpolation loop
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let elapsed = 0;
    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      elapsed += dt;

      if (hasEventsRef.current) {
        // Smooth toward actual device data
        currentRef.current.alpha = lerp(currentRef.current.alpha, targetRef.current.alpha, 0.08);
        currentRef.current.beta = lerp(currentRef.current.beta, targetRef.current.beta, 0.08);
        currentRef.current.gamma = lerp(currentRef.current.gamma, targetRef.current.gamma, 0.08);
      } else {
        // Fallback: gentle auto-orbit
        currentRef.current.alpha = Math.sin(elapsed * 0.15) * 15;
        currentRef.current.beta = Math.cos(elapsed * 0.1) * 10;
        currentRef.current.gamma = Math.sin(elapsed * 0.12) * 8;
      }

      dispatch({ type: 'SET_GYROSCOPE', payload: { ...currentRef.current } });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // If no events after 2s, stay on auto-orbit
    const timeout = setTimeout(() => {
      // hasEventsRef stays false if no events came in
    }, 2000);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeout);
    };
  }, [enabled, handleOrientation, dispatch]);
}
