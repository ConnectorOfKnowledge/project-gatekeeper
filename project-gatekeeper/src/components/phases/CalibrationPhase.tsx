'use client';

// ============================================================
// CalibrationPhase — Sequential permission requests
// Microphone → Motion → Location
// Any denial triggers immediate rejection.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGatekeeper } from '@/context/GatekeeperContext';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionCard } from '@/components/ui/PermissionCard';
import { GlowBlock } from '@/components/ui/GlowText';
import { TIMING } from '@/lib/constants';
import type { PermissionType } from '@/types';

const PERMISSION_SEQUENCE: {
  type: PermissionType;
  icon: 'microphone' | 'motion' | 'location';
  prompt: string;
}[] = [
  {
    type: 'microphone',
    icon: 'microphone',
    prompt: 'Your voice is the key to this encounter. Grant access to your microphone so we may hear your frequency.',
  },
  {
    type: 'motion',
    icon: 'motion',
    prompt: 'The constellation responds to your presence. Allow motion sensing to attune the field to your movement.',
  },
  {
    type: 'location',
    icon: 'location',
    prompt: 'Every signal has an origin. Share your coordinates so we may map your position in the network.',
  },
];

type CalibrationStage = 'intro' | 'requesting' | 'transitioning' | 'complete';

export default function CalibrationPhase() {
  const { dispatch } = useGatekeeper();
  const { requestMicrophone, requestMotion, requestLocation } = usePermissions();
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro stage
  const [stage, setStage] = useState<CalibrationStage>('intro');
  const [isProcessing, setIsProcessing] = useState(false);

  // Show intro text, then begin permission sequence
  useEffect(() => {
    if (stage === 'intro') {
      const timer = setTimeout(() => {
        setStage('requesting');
        setCurrentIndex(0);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Map permission type to request function
  const getRequestFn = useCallback((type: PermissionType) => {
    switch (type) {
      case 'microphone': return requestMicrophone;
      case 'motion': return requestMotion;
      case 'location': return requestLocation;
    }
  }, [requestMicrophone, requestMotion, requestLocation]);

  const handleGrant = useCallback(async () => {
    if (currentIndex < 0 || currentIndex >= PERMISSION_SEQUENCE.length) return;
    setIsProcessing(true);

    const perm = PERMISSION_SEQUENCE[currentIndex];
    const requestFn = getRequestFn(perm.type);
    const granted = await requestFn();

    if (!granted) {
      // Permission denied → rejection
      dispatch({ type: 'SET_PHASE', payload: 'REJECTION' });
      return;
    }

    setIsProcessing(false);
    setStage('transitioning');

    // Brief gap before showing next permission or advancing
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < PERMISSION_SEQUENCE.length) {
        setCurrentIndex(nextIndex);
        setStage('requesting');
      } else {
        setStage('complete');
      }
    }, TIMING.permissionGap);
  }, [currentIndex, getRequestFn, dispatch]);

  // Auto-advance when all permissions are granted
  useEffect(() => {
    if (stage === 'complete') {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_PHASE', payload: 'VOICE_INTERFACE' });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stage, dispatch]);

  const currentPermission = currentIndex >= 0 && currentIndex < PERMISSION_SEQUENCE.length
    ? PERMISSION_SEQUENCE[currentIndex]
    : null;

  return (
    <div className="w-full">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8 text-center"
      >
        <h2 className="text-xs tracking-[0.25em] uppercase text-white/40 font-light mb-1">
          Calibration Sequence
        </h2>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#7C4DFF]/30 to-transparent mx-auto" />
      </motion.div>

      {/* Progress dots */}
      <div className="flex justify-center gap-3 mb-8">
        {PERMISSION_SEQUENCE.map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            animate={{
              backgroundColor:
                i < currentIndex
                  ? 'rgba(79, 195, 247, 0.8)'
                  : i === currentIndex
                  ? 'rgba(79, 195, 247, 0.5)'
                  : 'rgba(255, 255, 255, 0.15)',
              scale: i === currentIndex ? 1.3 : 1,
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Intro text */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <GlowBlock
              text="To properly calibrate this channel, we require access to your device's sensory systems."
              className="text-white/60 text-sm font-light tracking-wide leading-relaxed"
              glowColor="124, 77, 255"
              delay={0.3}
              duration={1}
            />
          </motion.div>
        )}

        {/* Permission card */}
        {(stage === 'requesting' || stage === 'transitioning') && currentPermission && (
          <PermissionCard
            key={currentPermission.type}
            icon={currentPermission.icon}
            prompt={currentPermission.prompt}
            onGrant={handleGrant}
            isProcessing={isProcessing}
          />
        )}

        {/* Complete — brief flash before advancing */}
        {stage === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <GlowBlock
              text="All channels aligned."
              className="text-[#4FC3F7]/80 text-sm font-light tracking-[0.15em] uppercase"
              glowColor="79, 195, 247"
              delay={0}
              duration={0.5}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
