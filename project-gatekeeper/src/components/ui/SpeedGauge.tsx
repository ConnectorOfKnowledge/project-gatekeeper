'use client';

// ============================================================
// SpeedGauge — Speed test metric display with animated number
// ============================================================

import { motion } from 'framer-motion';

interface SpeedGaugeProps {
  label: string;
  value: number;
  unit: string;
  active: boolean;
  complete: boolean;
}

export function SpeedGauge({ label, value, unit, active, complete }: SpeedGaugeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: active || complete ? 1 : 0.3, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-6"
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs tracking-[0.2em] uppercase text-white/50 font-light">
          {label}
        </span>
        <span className="text-xs text-white/30 font-mono">
          {active ? 'MEASURING' : complete ? 'VERIFIED' : 'STANDBY'}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-mono font-light tracking-tight tabular-nums"
          style={{
            color: complete ? '#4FC3F7' : '#FFFFFF',
            textShadow: active
              ? '0 0 10px rgba(79, 195, 247, 0.5), 0 0 30px rgba(79, 195, 247, 0.2)'
              : 'none',
            transition: 'color 0.5s, text-shadow 0.5s',
          }}
        >
          {value.toFixed(1)}
        </span>
        <span className="text-sm text-white/40 font-mono">{unit}</span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-px bg-white/10 overflow-hidden">
        <motion.div
          className="h-full"
          style={{
            background: 'linear-gradient(90deg, #4A148C, #4FC3F7)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: complete ? '100%' : active ? `${Math.min(value * 0.8, 100)}%` : '0%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
