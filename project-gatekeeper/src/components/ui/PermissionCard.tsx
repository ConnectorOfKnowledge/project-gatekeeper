'use client';

// ============================================================
// PermissionCard — Frosted glass permission request card
// ============================================================

import { motion } from 'framer-motion';

interface PermissionCardProps {
  icon: 'microphone' | 'motion' | 'location';
  prompt: string;
  onGrant: () => void;
  isProcessing?: boolean;
}

const icons = {
  microphone: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v4m-4 0h8" />
    </svg>
  ),
  motion: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
      <path d="m4.93 4.93 2.83 2.83m8.48 8.48 2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
    </svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
};

export function PermissionCard({ icon, prompt, onGrant, isProcessing }: PermissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, y: -20, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm mx-auto"
    >
      <div
        className="rounded-2xl border border-white/10 p-8 text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="text-[#4FC3F7]"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(79, 195, 247, 0.4))',
            }}
          >
            {icons[icon]}
          </div>
        </div>

        {/* Prompt */}
        <p
          className="text-white/80 text-sm leading-relaxed mb-8 font-light tracking-wide"
          style={{
            textShadow: '0 0 20px rgba(79, 195, 247, 0.1)',
          }}
        >
          {prompt}
        </p>

        {/* Grant button */}
        <button
          onClick={onGrant}
          disabled={isProcessing}
          className="relative w-full py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-light
            text-white/90 border border-white/15 transition-all duration-300
            hover:border-[#4FC3F7]/40 hover:text-white hover:shadow-[0_0_20px_rgba(79,195,247,0.15)]
            active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
          style={{
            background: 'rgba(79, 195, 247, 0.06)',
          }}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border border-white/30 border-t-white/80 rounded-full"
              />
              Aligning...
            </span>
          ) : (
            'Grant Access'
          )}
        </button>
      </div>
    </motion.div>
  );
}
