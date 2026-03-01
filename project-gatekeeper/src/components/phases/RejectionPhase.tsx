'use client';

// ============================================================
// RejectionPhase — "Hard No" terminal state
// Constellation scatters. Text fades in cold and final.
// Records the rejection to localStorage so future visits
// from this device hit the permanent block.
// ============================================================

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGatekeeper } from '@/context/GatekeeperContext';
import { recordRejection } from '@/lib/deviceIdentity';
import { GlowBlock } from '@/components/ui/GlowText';

export default function RejectionPhase() {
  const { state } = useGatekeeper();
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [recorded, setRecorded] = useState(false);

  // Record rejection to localStorage
  useEffect(() => {
    if (!recorded && state.deviceFingerprint) {
      recordRejection(state.deviceFingerprint);
      setRecorded(true);
    }
  }, [state.deviceFingerprint, recorded]);

  // Show second line after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSecondLine(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-8">
      {/* Cold icon — fading X */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg viewBox="0 0 48 48" fill="none" className="w-16 h-16 text-white/15" stroke="currentColor" strokeWidth={0.5}>
          <circle cx="24" cy="24" r="22" strokeDasharray="4 6" />
          <path d="M17 17l14 14M31 17L17 31" strokeWidth={0.8} />
        </svg>
      </motion.div>

      {/* Primary message */}
      <GlowBlock
        text="Frequency misalignment detected."
        className="text-white/60 text-base font-light tracking-wide"
        glowColor="124, 77, 255"
        delay={0.8}
        duration={2}
      />

      {/* Secondary message */}
      {showSecondLine && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <GlowBlock
            text="This channel is not available to you at this time."
            className="text-white/35 text-sm font-light tracking-wide leading-relaxed"
            glowColor="74, 20, 140"
            delay={0}
            duration={1.5}
          />
        </motion.div>
      )}

      {/* No retry. No buttons. Dead end. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 6, duration: 3 }}
        className="absolute bottom-16"
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-light">
          Connection terminated
        </p>
      </motion.div>
    </div>
  );
}
