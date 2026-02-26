'use client';

// ============================================================
// Project Gatekeeper — State Machine Context
// ============================================================

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { GatekeeperState, GatekeeperAction } from '@/types';

const initialState: GatekeeperState = {
  phase: 'DEVICE_CHECK',
  permissions: {
    microphone: 'pending',
    motion: 'pending',
    location: 'pending',
  },
  speedTestResult: null,
  audioLevel: 0,
  gyroscopeData: { alpha: 0, beta: 0, gamma: 0 },
  userName: '',
  userPhone: '',
  isTransitioning: false,
  deviceFingerprint: null,
  micStream: null,
};

function reducer(state: GatekeeperState, action: GatekeeperAction): GatekeeperState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'SET_PERMISSION':
      return {
        ...state,
        permissions: {
          ...state.permissions,
          [action.payload.permission]: action.payload.status,
        },
      };
    case 'SET_SPEED_RESULT':
      return { ...state, speedTestResult: action.payload };
    case 'SET_AUDIO_LEVEL':
      return { ...state, audioLevel: action.payload };
    case 'SET_GYROSCOPE':
      return { ...state, gyroscopeData: action.payload };
    case 'SET_USER_DATA':
      return {
        ...state,
        userName: action.payload.name,
        userPhone: action.payload.phone,
      };
    case 'SET_TRANSITIONING':
      return { ...state, isTransitioning: action.payload };
    case 'SET_FINGERPRINT':
      return { ...state, deviceFingerprint: action.payload };
    case 'SET_MIC_STREAM':
      return { ...state, micStream: action.payload };
    default:
      return state;
  }
}

interface GatekeeperContextType {
  state: GatekeeperState;
  dispatch: Dispatch<GatekeeperAction>;
}

const GatekeeperContext = createContext<GatekeeperContextType | null>(null);

export function GatekeeperProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GatekeeperContext.Provider value={{ state, dispatch }}>
      {children}
    </GatekeeperContext.Provider>
  );
}

export function useGatekeeper(): GatekeeperContextType {
  const context = useContext(GatekeeperContext);
  if (!context) {
    throw new Error('useGatekeeper must be used within a GatekeeperProvider');
  }
  return context;
}
