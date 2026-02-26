'use client';

import { useState, useRef, useCallback } from 'react';
import { SPEED_TEST } from '@/lib/constants';

type SpeedTestPhase = 'idle' | 'latency' | 'download' | 'upload' | 'complete';

interface SpeedTestState {
  phase: SpeedTestPhase;
  latency: number;
  download: number;
  upload: number;
  progress: number; // 0-1 overall progress
}

/**
 * Simulated speed test with realistic-looking animated values.
 * Each metric animates with cubic ease-out + random fluctuation.
 * onComplete receives the final values to avoid closure staleness.
 */
export function useSpeedTest(onComplete?: (results: { latency: number; download: number; upload: number }) => void) {
  const [state, setState] = useState<SpeedTestState>({
    phase: 'idle',
    latency: 0,
    download: 0,
    upload: 0,
    progress: 0,
  });

  const rafRef = useRef<number>(0);
  const isRunning = useRef(false);

  const start = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    const { latencyRange, downloadRange, uploadRange } = SPEED_TEST;
    const { latencyDuration, downloadDuration, uploadDuration, staggerDelay } = SPEED_TEST;

    // Generate targets with some randomness
    const targetLatency = latencyRange[0] + Math.random() * (latencyRange[1] - latencyRange[0]);
    const targetDownload = downloadRange[0] + Math.random() * (downloadRange[1] - downloadRange[0]);
    const targetUpload = uploadRange[0] + Math.random() * (uploadRange[1] - uploadRange[0]);

    const totalDuration = latencyDuration + staggerDelay + downloadDuration + staggerDelay + uploadDuration + 800;
    const startTime = performance.now();

    // Ease-out cubic with fluctuation
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const fluctuate = (value: number, amount: number) =>
      value * (1 + (Math.random() - 0.5) * amount);

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const overall = Math.min(elapsed / totalDuration, 1);

      // Determine which metric is active
      let latencyVal = 0;
      let downloadVal = 0;
      let uploadVal = 0;
      let currentPhase: SpeedTestPhase = 'latency';

      // Latency: starts at 0ms
      const latencyProgress = Math.min(elapsed / latencyDuration, 1);
      latencyVal = fluctuate(targetLatency * easeOutCubic(latencyProgress), 0.04);

      // Download: starts after latency + stagger
      const downloadStart = latencyDuration + staggerDelay;
      if (elapsed > downloadStart) {
        currentPhase = 'download';
        const dp = Math.min((elapsed - downloadStart) / downloadDuration, 1);
        downloadVal = fluctuate(targetDownload * easeOutCubic(dp), 0.06);
      }

      // Upload: starts after download + stagger
      const uploadStart = downloadStart + downloadDuration + staggerDelay;
      if (elapsed > uploadStart) {
        currentPhase = 'upload';
        const up = Math.min((elapsed - uploadStart) / uploadDuration, 1);
        uploadVal = fluctuate(targetUpload * easeOutCubic(up), 0.06);
      }

      // Final hold
      if (elapsed > totalDuration - 800) {
        currentPhase = 'complete';
        latencyVal = targetLatency;
        downloadVal = targetDownload;
        uploadVal = targetUpload;
      }

      setState({
        phase: currentPhase,
        latency: Math.round(latencyVal * 10) / 10,
        download: Math.round(downloadVal * 10) / 10,
        upload: Math.round(uploadVal * 10) / 10,
        progress: overall,
      });

      if (overall < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        isRunning.current = false;
        // Pass final rounded values directly — avoids stale closure issues
        onComplete?.({
          latency: Math.round(targetLatency * 10) / 10,
          download: Math.round(targetDownload * 10) / 10,
          upload: Math.round(targetUpload * 10) / 10,
        });
      }
    };

    setState((s) => ({ ...s, phase: 'latency' }));
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      isRunning.current = false;
    };
  }, [onComplete]);

  return { ...state, start };
}
