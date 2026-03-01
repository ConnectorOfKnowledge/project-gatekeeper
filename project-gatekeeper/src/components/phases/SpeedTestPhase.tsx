'use client';

// ============================================================
// SpeedTestPhase — "System Diagnostic"
// Three stacked gauges (latency, download, upload) that animate
// in sequence. Auto-advances when the test completes.
// ============================================================

import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useGatekeeper } from '@/context/GatekeeperContext';
import { useSpeedTest } from '@/hooks/useSpeedTest';
import { SpeedGauge } from '@/components/ui/SpeedGauge';
import { GlowBlock } from '@/components/ui/GlowText';

const STATUS_MESSAGES = [
  'Initializing frequency scan...',
  'Measuring signal latency...',
  'Testing bandwidth capacity...',
  'Analyzing upload channel...',
  'Connection profile compiled.',
];

export default function SpeedTestPhase() {
  const { dispatch } = useGatekeeper();
  const [hasStarted, setHasStarted] = useState(false);

  // onComplete receives final values directly from the hook — no stale closure
  const onComplete = useCallback((results: { latency: number; download: number; upload: number }) => {
    // Delay before advancing to let the user see the results
    setTimeout(() => {
      dispatch({ type: 'SET_SPEED_RESULT', payload: results });
      dispatch({ type: 'SET_PHASE', payload: 'CALIBRATION' });
    }, 1800);
  }, [dispatch]);

  const speedTest = useSpeedTest(onComplete);

  // Start the test after a brief delay
  useEffect(() => {
    if (!hasStarted) {
      const timer = setTimeout(() => {
        speedTest.start();
        setHasStarted(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, speedTest]);

  // Determine status message
  const getStatusMessage = () => {
    switch (speedTest.phase) {
      case 'idle': return STATUS_MESSAGES[0];
      case 'latency': return STATUS_MESSAGES[1];
      case 'download': return STATUS_MESSAGES[2];
      case 'upload': return STATUS_MESSAGES[3];
      case 'complete': return STATUS_MESSAGES[4];
      default: return STATUS_MESSAGES[0];
    }
  };

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
          System Diagnostic
        </h2>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#4FC3F7]/30 to-transparent mx-auto" />
      </motion.div>

      {/* Frosted glass container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-2xl border border-white/10 p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Gauges */}
        <SpeedGauge
          label="Latency"
          value={speedTest.latency}
          unit="ms"
          active={speedTest.phase === 'latency'}
          complete={speedTest.phase === 'download' || speedTest.phase === 'upload' || speedTest.phase === 'complete'}
        />
        <SpeedGauge
          label="Download"
          value={speedTest.download}
          unit="Mbps"
          active={speedTest.phase === 'download'}
          complete={speedTest.phase === 'upload' || speedTest.phase === 'complete'}
        />
        <SpeedGauge
          label="Upload"
          value={speedTest.upload}
          unit="Mbps"
          active={speedTest.phase === 'upload'}
          complete={speedTest.phase === 'complete'}
        />

        {/* Overall progress bar */}
        <div className="mt-4 h-px bg-white/5 overflow-hidden rounded-full">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #4A148C, #4FC3F7, #7C4DFF)',
            }}
            animate={{ width: `${speedTest.progress * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Status text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center"
      >
        <GlowBlock
          key={getStatusMessage()}
          text={getStatusMessage()}
          className="text-xs tracking-[0.15em] text-white/35 font-light"
          glowColor="79, 195, 247"
          delay={0}
          duration={0.5}
        />
      </motion.div>
    </div>
  );
}
