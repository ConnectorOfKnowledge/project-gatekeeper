'use client';

// ============================================================
// AcceptancePhase — Successful alignment
// Constellation converges to bright core.
// Collects name + phone via PhoneInput.
// Closing message after submission.
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGatekeeper } from '@/context/GatekeeperContext';
import { GlowText, GlowBlock } from '@/components/ui/GlowText';
import { PhoneInput } from '@/components/ui/PhoneInput';

type AcceptanceStage = 'reveal' | 'form' | 'farewell';

export default function AcceptancePhase() {
  const { dispatch } = useGatekeeper();
  const [stage, setStage] = useState<AcceptanceStage>('reveal');

  // After reveal text, show form
  const handleRevealComplete = () => {
    setTimeout(() => setStage('form'), 1500);
  };

  // After form submission
  const handleSubmit = (name: string, phone: string) => {
    dispatch({ type: 'SET_USER_DATA', payload: { name, phone } });
    setStage('farewell');
  };

  return (
    <div className="w-full flex flex-col items-center">
      <AnimatePresence mode="wait">
        {/* Stage 1: Reveal */}
        {stage === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="text-center flex flex-col items-center gap-6"
          >
            {/* Glowing confirmation icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-20 h-20 flex items-center justify-center"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(79, 195, 247, 0.15), transparent 70%)',
                  boxShadow: '0 0 60px rgba(79, 195, 247, 0.2), 0 0 120px rgba(79, 195, 247, 0.1)',
                }}
              />
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#4FC3F7]" stroke="currentColor" strokeWidth={1.5}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>

            <div>
              <GlowText
                text="Alignment confirmed."
                className="text-xl font-light tracking-wide text-white/90"
                delay={0.5}
                stagger={0.04}
                glowColor="79, 195, 247"
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
              onAnimationComplete={handleRevealComplete}
            >
              <GlowBlock
                text="We require a means of contact."
                className="text-white/50 text-sm font-light tracking-wide"
                glowColor="79, 195, 247"
                delay={0}
                duration={1}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Stage 2: Phone form */}
        {stage === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center text-xs tracking-[0.2em] uppercase text-white/30 font-light mb-8"
            >
              Transmit your coordinates
            </motion.p>

            <PhoneInput onSubmit={handleSubmit} />
          </motion.div>
        )}

        {/* Stage 3: Farewell */}
        {stage === 'farewell' && (
          <motion.div
            key="farewell"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center flex flex-col items-center gap-8"
          >
            {/* Glowing orb */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-3 h-3 rounded-full"
              style={{
                background: 'radial-gradient(circle, #4FC3F7, transparent)',
                boxShadow: '0 0 20px rgba(79, 195, 247, 0.6), 0 0 60px rgba(79, 195, 247, 0.3)',
              }}
            />

            <div className="space-y-4">
              <GlowBlock
                text="Your signal has been received."
                className="text-white/80 text-base font-light tracking-wide"
                glowColor="79, 195, 247"
                delay={0.5}
                duration={1.2}
              />
              <GlowBlock
                text="Exercise patience."
                className="text-white/60 text-sm font-light tracking-wide"
                glowColor="79, 195, 247"
                delay={1.8}
                duration={1}
              />
              <GlowBlock
                text="The timing of alignments is not ours to command."
                className="text-white/40 text-sm font-light tracking-wide leading-relaxed"
                glowColor="124, 77, 255"
                delay={3}
                duration={1.5}
              />
            </div>

            {/* Subtle breathing dot */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 5, duration: 2 }}
            >
              <div className="loading-pulse" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
