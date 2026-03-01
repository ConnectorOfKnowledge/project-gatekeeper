'use client';

// ============================================================
// EntryPhase — The first real moment of the experience
// Black screen → mystical text reveal → auto-advance
// ============================================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGatekeeper } from '@/context/GatekeeperContext';
import { GlowText, GlowBlock } from '@/components/ui/GlowText';
import { TIMING } from '@/lib/constants';

export default function EntryPhase() {
  const { dispatch } = useGatekeeper();
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // Stage 0 → 1: Show first line
    const t1 = setTimeout(() => setStage(1), 400);

    // Stage 1 → 2: Show second line
    const t2 = setTimeout(() => setStage(2), TIMING.entryHoldDuration);

    // Auto-advance after both lines shown
    const t3 = setTimeout(() => {
      dispatch({ type: 'SET_PHASE', payload: 'SPEED_TEST' });
    }, TIMING.entryHoldDuration + TIMING.entrySecondLineDuration + 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-8">
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div
            key="line1"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8 }}
          >
            <GlowText
              text="This encounter requires"
              className="text-lg font-light tracking-wide text-white/85"
              delay={0}
              stagger={0.035}
            />
            <GlowText
              text="a high-fidelity connection."
              className="text-lg font-light tracking-wide text-white/85 mt-1"
              delay={0.8}
              stagger={0.035}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage >= 2 && (
          <motion.div
            key="line2"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlowBlock
              text="Initiating systems check..."
              className="text-xs tracking-[0.2em] uppercase text-white/40 font-light"
              glowColor="79, 195, 247"
              delay={0.3}
              duration={1}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle pulse indicator at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 2 ? 0.5 : 0 }}
        transition={{ duration: 1 }}
        className="absolute bottom-20"
      >
        <div className="loading-pulse" />
      </motion.div>
    </div>
  );
}
