'use client';

// ============================================================
// PhoneInput — Name + Phone collection form (acceptance state)
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PhoneInputProps {
  onSubmit: (name: string, phone: string) => void;
}

export function PhoneInput({ onSubmit }: PhoneInputProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setIsSubmitting(true);
    // Brief delay for visual feedback
    setTimeout(() => {
      onSubmit(name.trim(), phone.trim());
    }, 500);
  };

  const isValid = name.trim().length > 0 && phone.replace(/\D/g, '').length >= 10;

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit}
      className="w-full max-w-sm mx-auto"
    >
      <div
        className="rounded-2xl border border-white/10 p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Name field */}
        <div className="mb-6">
          <label className="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2 font-light">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="As you are known"
            autoComplete="name"
            className="w-full bg-transparent border-0 border-b border-white/15 pb-2 text-white/90
              placeholder:text-white/20 text-base font-light tracking-wide
              focus:outline-none focus:border-[#4FC3F7]/50 transition-colors duration-300"
          />
        </div>

        {/* Phone field */}
        <div className="mb-8">
          <label className="block text-xs tracking-[0.2em] uppercase text-white/40 mb-2 font-light">
            Contact Frequency
          </label>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(000) 000-0000"
            autoComplete="tel"
            className="w-full bg-transparent border-0 border-b border-white/15 pb-2 text-white/90
              placeholder:text-white/20 text-base font-mono tracking-wider
              focus:outline-none focus:border-[#4FC3F7]/50 transition-colors duration-300"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="relative w-full py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-light
            text-white/90 border border-white/15 transition-all duration-300
            hover:border-[#4FC3F7]/40 hover:text-white hover:shadow-[0_0_20px_rgba(79,195,247,0.15)]
            active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: isValid ? 'rgba(79, 195, 247, 0.08)' : 'transparent',
          }}
        >
          {isSubmitting ? 'Transmitting...' : 'Submit Coordinates'}
        </button>
      </div>
    </motion.form>
  );
}
