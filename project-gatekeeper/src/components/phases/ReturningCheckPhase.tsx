'use client';

// ============================================================
// ReturningCheckPhase — Device identity gate
// Checks localStorage for this device's fingerprint:
//   • Same device, rejected within 6 months → permanent block
//   • Same device, previously attempted → could proceed
//   • Different device, same IP (future) → honesty gate UI
//   • Clean device → auto-advance to ENTRY
// ============================================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGatekeeper } from '@/context/GatekeeperContext';
import { useDeviceFingerprint } from '@/hooks/useDeviceFingerprint';
import { recordAttempt, checkIPHistory } from '@/lib/deviceIdentity';
import { GlowBlock } from '@/components/ui/GlowText';
import { TIMING } from '@/lib/constants';

type CheckState =
  | 'checking'
  | 'blocked'      // same device, rejected within cooldown
  | 'honesty_gate' // different device, same IP (future backend)
  | 'clean';       // no issues, proceed

export default function ReturningCheckPhase() {
  const { dispatch } = useGatekeeper();
  const { fingerprint, isBlocked, cooldownExpiry, isLoading } = useDeviceFingerprint();
  const [checkState, setCheckState] = useState<CheckState>('checking');
  const [showHonestyWarning, setShowHonestyWarning] = useState(false);

  useEffect(() => {
    if (isLoading || !fingerprint) return;

    const runCheck = async () => {
      // 1. Same device, rejected within cooldown
      if (isBlocked) {
        dispatch({ type: 'SET_FINGERPRINT', payload: fingerprint });
        setCheckState('blocked');
        return;
      }

      // 2. Check IP history (currently stubbed)
      const ipResult = await checkIPHistory();
      if (ipResult?.hasRejectedDevices) {
        dispatch({ type: 'SET_FINGERPRINT', payload: fingerprint });
        setCheckState('honesty_gate');
        return;
      }

      // 3. Clean device — record attempt and advance
      dispatch({ type: 'SET_FINGERPRINT', payload: fingerprint });
      recordAttempt(fingerprint);
      setCheckState('clean');
    };

    const timer = setTimeout(runCheck, TIMING.returningCheckDelay);
    return () => clearTimeout(timer);
  }, [isLoading, fingerprint, isBlocked, dispatch]);

  // Auto-advance if clean
  useEffect(() => {
    if (checkState === 'clean') {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_PHASE', payload: 'ENTRY' });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [checkState, dispatch]);

  // Format cooldown expiry
  const formatExpiry = (date: Date | null) => {
    if (!date) return 'the cycle completes';
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleHonestyProceed = () => {
    if (!fingerprint) return;
    recordAttempt(fingerprint);
    dispatch({ type: 'SET_PHASE', payload: 'ENTRY' });
  };

  const handleHonestyExit = () => {
    // Graceful exit — just show a farewell and stay on page
    setCheckState('blocked');
  };

  return (
    <div className="w-full text-center">
      <AnimatePresence mode="wait">
        {/* Checking state — subtle loading */}
        {checkState === 'checking' && (
          <motion.div
            key="checking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="loading-pulse" />
            <p className="text-xs tracking-[0.2em] uppercase text-white/30 font-light">
              Sensing resonance
            </p>
          </motion.div>
        )}

        {/* Blocked state — permanent rejection */}
        {checkState === 'blocked' && (
          <motion.div
            key="blocked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Dim, cold icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white/20" stroke="currentColor" strokeWidth={1}>
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </motion.div>

            <div className="space-y-4">
              <GlowBlock
                text="Your frequency was already measured."
                className="text-white/70 text-sm font-light tracking-wide leading-relaxed"
                glowColor="124, 77, 255"
                delay={0.8}
                duration={1.5}
              />
              <GlowBlock
                text="The resonance has not yet shifted."
                className="text-white/50 text-sm font-light tracking-wide leading-relaxed"
                glowColor="124, 77, 255"
                delay={1.8}
                duration={1.5}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5, duration: 1.5 }}
              className="text-xs text-white/25 tracking-wide font-light mt-4"
            >
              Return when the cycle completes
              {cooldownExpiry && (
                <span className="block mt-1 text-white/15 font-mono text-[10px]">
                  ≈ {formatExpiry(cooldownExpiry)}
                </span>
              )}
            </motion.p>
          </motion.div>
        )}

        {/* Honesty Gate — same IP, different device (future backend) */}
        {checkState === 'honesty_gate' && (
          <motion.div
            key="honesty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            {!showHonestyWarning ? (
              <>
                <GlowBlock
                  text="A signal originating from your coordinates has sought alignment before."
                  className="text-white/70 text-sm font-light tracking-wide leading-relaxed"
                  glowColor="255, 213, 79"
                  delay={0.3}
                  duration={1.2}
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="space-y-3 mt-4"
                >
                  <button
                    onClick={() => setShowHonestyWarning(true)}
                    className="w-full py-3 rounded-xl text-sm tracking-[0.1em] uppercase font-light
                      text-white/80 border border-white/10 transition-all duration-300
                      hover:border-[#4FC3F7]/30 hover:text-white"
                    style={{ background: 'rgba(79, 195, 247, 0.05)' }}
                  >
                    I have not sought this before
                  </button>
                  <button
                    onClick={handleHonestyExit}
                    className="w-full py-3 rounded-xl text-sm tracking-[0.1em] font-light
                      text-white/40 border border-white/5 transition-all duration-300
                      hover:border-white/10 hover:text-white/60"
                  >
                    I understand — I will return
                  </button>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                {/* Stern warning */}
                <div className="space-y-4">
                  <GlowBlock
                    text="Integrity is the first frequency we measure."
                    className="text-[#FFD54F]/80 text-sm font-light tracking-wide leading-relaxed"
                    glowColor="255, 213, 79"
                    delay={0.2}
                    duration={1}
                  />
                  <GlowBlock
                    text="Deception severs all future connections — permanently."
                    className="text-white/60 text-sm font-light tracking-wide leading-relaxed"
                    glowColor="255, 213, 79"
                    delay={1.2}
                    duration={1}
                  />
                  <GlowBlock
                    text="If you have previously walked this path, honor the cycle and return when your time comes."
                    className="text-white/45 text-xs font-light tracking-wide leading-relaxed"
                    glowColor="124, 77, 255"
                    delay={2.2}
                    duration={1}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.5 }}
                  className="space-y-3"
                >
                  <button
                    onClick={handleHonestyProceed}
                    className="w-full py-3 rounded-xl text-sm tracking-[0.1em] uppercase font-light
                      text-white/80 border border-[#FFD54F]/20 transition-all duration-300
                      hover:border-[#FFD54F]/40 hover:text-white"
                    style={{ background: 'rgba(255, 213, 79, 0.05)' }}
                  >
                    I speak truth — proceed
                  </button>
                  <button
                    onClick={handleHonestyExit}
                    className="w-full py-3 rounded-xl text-sm tracking-[0.1em] font-light
                      text-white/30 border border-white/5 transition-all duration-300
                      hover:border-white/10 hover:text-white/50"
                  >
                    I will honor the cycle
                  </button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
