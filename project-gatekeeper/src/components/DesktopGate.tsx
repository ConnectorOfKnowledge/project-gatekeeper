'use client';

// ============================================================
// DesktopGate — "Mobile Device Required" screen
// Shown to desktop visitors. Minimal floating particles on
// a void black background.
// ============================================================

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export default function DesktopGate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Minimal floating particles background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.3 + 0.05,
    }));

    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 195, 247, ${p.opacity})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity: 0.5 }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center px-8"
      >
        {/* Icon — Phone silhouette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mb-10 w-12 h-20 rounded-xl border border-white/20 flex items-center justify-center"
          style={{
            background: 'rgba(79, 195, 247, 0.04)',
            boxShadow: '0 0 30px rgba(79, 195, 247, 0.08)',
          }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(79, 195, 247, 0.6), transparent)',
            }}
          />
        </motion.div>

        <h1
          className="text-2xl font-light tracking-wide text-white/90 mb-4"
          style={{
            textShadow: '0 0 20px rgba(79, 195, 247, 0.3)',
          }}
        >
          Mobile Device Required
        </h1>

        <p className="text-sm text-white/40 font-light tracking-wide leading-relaxed max-w-xs mx-auto mb-2">
          This experience is calibrated for
        </p>
        <p className="text-sm text-white/40 font-light tracking-wide leading-relaxed max-w-xs mx-auto">
          the intimacy of a handheld device.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-12"
        >
          <p className="text-xs text-white/20 tracking-[0.2em] uppercase font-light">
            Return on your phone to proceed
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
