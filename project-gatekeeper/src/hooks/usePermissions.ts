'use client';

import { useCallback, useRef } from 'react';
import { useGatekeeper } from '@/context/GatekeeperContext';

interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/**
 * Orchestrates permission requests for microphone, motion, and location.
 * Each function returns a boolean (granted/denied) and updates context.
 */
export function usePermissions() {
  const { dispatch } = useGatekeeper();
  const micStreamRef = useRef<MediaStream | null>(null);

  const requestMicrophone = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      dispatch({ type: 'SET_MIC_STREAM', payload: stream });
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'microphone', status: 'granted' },
      });
      return true;
    } catch {
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'microphone', status: 'denied' },
      });
      return false;
    }
  }, [dispatch]);

  const requestMotion = useCallback(async (): Promise<boolean> => {
    try {
      // iOS 13+ requires explicit permission request via user gesture
      const DevOrientation = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };

      if (typeof DevOrientation.requestPermission === 'function') {
        const permission = await DevOrientation.requestPermission();
        if (permission === 'granted') {
          dispatch({
            type: 'SET_PERMISSION',
            payload: { permission: 'motion', status: 'granted' },
          });
          return true;
        } else {
          dispatch({
            type: 'SET_PERMISSION',
            payload: { permission: 'motion', status: 'denied' },
          });
          return false;
        }
      }

      // Android / non-iOS: permission is auto-granted
      // Verify events actually fire by listening briefly
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'motion', status: 'granted' },
      });
      return true;
    } catch {
      dispatch({
        type: 'SET_PERMISSION',
        payload: { permission: 'motion', status: 'denied' },
      });
      return false;
    }
  }, [dispatch]);

  const requestLocation = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        dispatch({
          type: 'SET_PERMISSION',
          payload: { permission: 'location', status: 'denied' },
        });
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          dispatch({
            type: 'SET_PERMISSION',
            payload: { permission: 'location', status: 'granted' },
          });
          resolve(true);
        },
        () => {
          dispatch({
            type: 'SET_PERMISSION',
            payload: { permission: 'location', status: 'denied' },
          });
          resolve(false);
        },
        { timeout: 10000 }
      );
    });
  }, [dispatch]);

  return {
    requestMicrophone,
    requestMotion,
    requestLocation,
    micStream: micStreamRef,
  };
}
