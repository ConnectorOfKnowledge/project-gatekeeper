'use client';

// ============================================================
// GlowText — Animated glowing text with character-by-character reveal
// ============================================================

import { motion, type Variants } from 'framer-motion';

interface GlowTextProps {
  text: string;
  className?: string;
  delay?: number;
  glowColor?: string;
  stagger?: number;
  as?: 'h1' | 'h2' | 'p' | 'span';
}

export function GlowText({
  text,
  className = '',
  delay = 0,
  glowColor = '79, 195, 247', // electric blue RGB
  stagger = 0.03,
  as: Tag = 'p',
}: GlowTextProps) {
  const characters = text.split('');

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const charVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-block ${className}`}
      style={{
        textShadow: `
          0 0 7px rgba(${glowColor}, 0.7),
          0 0 20px rgba(${glowColor}, 0.4),
          0 0 40px rgba(${glowColor}, 0.15),
          0 0 80px rgba(${glowColor}, 0.05)
        `,
      }}
    >
      {characters.map((char, i) => (
        <motion.span
          key={`${i}-${char}`}
          variants={charVariants}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
}

/**
 * Simpler variant: full text fades in as a block (not per-character)
 */
export function GlowBlock({
  text,
  className = '',
  delay = 0,
  glowColor = '79, 195, 247',
  duration = 1.2,
}: {
  text: string;
  className?: string;
  delay?: number;
  glowColor?: string;
  duration?: number;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' as const }}
      className={className}
      style={{
        textShadow: `
          0 0 7px rgba(${glowColor}, 0.7),
          0 0 20px rgba(${glowColor}, 0.4),
          0 0 40px rgba(${glowColor}, 0.15)
        `,
      }}
    >
      {text}
    </motion.p>
  );
}
