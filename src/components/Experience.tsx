'use client';

// ============================================================
// Experience — State machine orchestrator
// Reads the current phase from context and renders the
// corresponding phase component inside AnimatePresence.
// ============================================================

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGatekeeper } from '@/context/GatekeeperContext';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import DesktopGate from './DesktopGate';

// Phase components
import ReturningCheckPhase from './phases/ReturningCheckPhase';
import EntryPhase from './phases/EntryPhase';
import SpeedTestPhase from './phases/SpeedTestPhase';
import CalibrationPhase from './phases/CalibrationPhase';
import VoicePhase from './phases/VoicePhase';
import RejectionPhase from './phases/RejectionPhase';
import AcceptancePhase from './phases/AcceptancePhase';

// Shared transition props for phase wrappers
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function Experience() {
  const { state, dispatch } = useGatekeeper();
  const isMobile = useDeviceDetect();

  // Desktop gate — if not mobile, show the gate
  // isMobile is null during first render (SSR safety)
  if (isMobile === false) {
    return <DesktopGate />;
  }

  // While detecting device, show nothing (constellation visible behind)
  if (isMobile === null) {
    return (
      <div className="fixed inset-0 z-10 flex items-center justify-center">
        <div className="loading-pulse" />
      </div>
    );
  }

  // Once mobile is confirmed and we're still on DEVICE_CHECK,
  // advance to RETURNING_CHECK
  // This is handled via the effect below
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center px-6 safe-bottom">
      <AnimatePresence mode="wait">
        <PhaseRenderer key={state.phase} phase={state.phase} />
      </AnimatePresence>
    </div>
  );
}

// Separated component so we can use hooks inside
function PhaseRenderer({ phase }: { phase: string }) {
  const { dispatch } = useGatekeeper();

  // Auto-advance from DEVICE_CHECK to RETURNING_CHECK on mobile
  useEffect(() => {
    if (phase === 'DEVICE_CHECK') {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_PHASE', payload: 'RETURNING_CHECK' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, dispatch]);

  switch (phase) {
    case 'DEVICE_CHECK':
      // Brief loading state while transitioning
      return (
        <motion.div {...pageTransition}>
          <div className="loading-pulse" />
        </motion.div>
      );

    case 'RETURNING_CHECK':
      return (
        <motion.div {...pageTransition} className="w-full max-w-sm">
          <ReturningCheckPhase />
        </motion.div>
      );

    case 'ENTRY':
      return (
        <motion.div {...pageTransition} className="w-full max-w-md text-center">
          <EntryPhase />
        </motion.div>
      );

    case 'SPEED_TEST':
      return (
        <motion.div {...pageTransition} className="w-full max-w-sm">
          <SpeedTestPhase />
        </motion.div>
      );

    case 'CALIBRATION':
      return (
        <motion.div {...pageTransition} className="w-full max-w-sm">
          <CalibrationPhase />
        </motion.div>
      );

    case 'VOICE_INTERFACE':
      return (
        <motion.div {...pageTransition} className="w-full max-w-sm">
          <VoicePhase />
        </motion.div>
      );

    case 'REJECTION':
      return (
        <motion.div {...pageTransition} className="w-full max-w-md text-center">
          <RejectionPhase />
        </motion.div>
      );

    case 'ACCEPTANCE':
      return (
        <motion.div {...pageTransition} className="w-full max-w-md text-center">
          <AcceptancePhase />
        </motion.div>
      );

    default:
      return null;
  }
}
