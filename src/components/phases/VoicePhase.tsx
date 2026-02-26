'use client';

// ============================================================
// VoicePhase — Voice interaction placeholder
// Timer-based alternation between "Listening" and "Thinking"
// states. Mic-reactive visuals drive the constellation.
// Architecture ready for Gemini API integration:
//   onSpeechStart, onSpeechEnd, onAIResponse callbacks
// ============================================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGatekeeper } from '@/context/GatekeeperContext';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { TIMING } from '@/lib/constants';

type VoiceState = 'intro' | 'listening' | 'thinking' | 'complete';

const PROMPTS = [
  'Tell us what you seek in this encounter.',
  'Describe the frequency you wish to operate at.',
  'Share the vision that brought you here.',
];

export default function VoicePhase() {
  const { state, dispatch } = useGatekeeper();
  const { micStream } = state;
  const { audioLevel } = useAudioAnalyzer(micStream);

  const [voiceState, setVoiceState] = useState<VoiceState>('intro');
  const [cycleIndex, setCycleIndex] = useState(0);
  const [waveformValues, setWaveformValues] = useState<number[]>(new Array(24).fill(0));
  const rafRef = useRef<number>(0);

  // Push audioLevel to context so constellation can react
  useEffect(() => {
    dispatch({ type: 'SET_AUDIO_LEVEL', payload: audioLevel });
  }, [audioLevel, dispatch]);

  // Animate waveform bars based on audio level
  useEffect(() => {
    if (voiceState !== 'listening') return;

    const animate = () => {
      setWaveformValues((prev) =>
        prev.map((_, i) => {
          const base = audioLevel * (0.3 + Math.random() * 0.7);
          const wave = Math.sin(Date.now() * 0.005 + i * 0.3) * 0.2 + 0.2;
          return Math.max(0.05, base + wave * audioLevel);
        })
      );
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [voiceState, audioLevel]);

  // === Cycle state machine ===
  // Intro → Listening → Thinking → Listening → Thinking → ... → Complete
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (voiceState === 'intro') {
      timer = setTimeout(() => setVoiceState('listening'), 2500);
    } else if (voiceState === 'listening') {
      timer = setTimeout(() => {
        setVoiceState('thinking');
        // Reset waveform when done listening
        setWaveformValues(new Array(24).fill(0));
      }, TIMING.voiceListenDuration);
    } else if (voiceState === 'thinking') {
      timer = setTimeout(() => {
        const nextCycle = cycleIndex + 1;
        if (nextCycle >= TIMING.voiceCycles) {
          setVoiceState('complete');
        } else {
          setCycleIndex(nextCycle);
          setVoiceState('listening');
        }
      }, TIMING.voiceThinkDuration);
    } else if (voiceState === 'complete') {
      timer = setTimeout(() => {
        dispatch({ type: 'SET_AUDIO_LEVEL', payload: 0 });
        dispatch({ type: 'SET_PHASE', payload: 'ACCEPTANCE' });
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [voiceState, cycleIndex, dispatch]);

  // === Future API integration hooks ===
  const onSpeechStart = useCallback(() => {
    // TODO: Start streaming audio to Gemini API
  }, []);

  const onSpeechEnd = useCallback(() => {
    // TODO: Stop streaming, await response
  }, []);

  const onAIResponse = useCallback((_response: string) => {
    // TODO: Display response text, trigger TTS, animate constellation
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Title — always visible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-10 text-center"
      >
        <h2 className="text-xs tracking-[0.25em] uppercase text-white/40 font-light mb-1">
          Voice Interface
        </h2>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#4FC3F7]/30 to-transparent mx-auto" />
      </motion.div>

      {/* Cycle progress */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: TIMING.voiceCycles }).map((_, i) => (
          <motion.div
            key={i}
            className="w-8 h-0.5 rounded-full"
            animate={{
              backgroundColor:
                i < cycleIndex
                  ? 'rgba(79, 195, 247, 0.6)'
                  : i === cycleIndex
                  ? 'rgba(79, 195, 247, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)',
            }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Intro */}
        {voiceState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-white/60 text-sm font-light tracking-wide leading-relaxed">
              The channel is open.
            </p>
            <p className="text-white/40 text-xs font-light tracking-wide mt-2">
              Speak when the field is receptive.
            </p>
          </motion.div>
        )}

        {/* Listening */}
        {voiceState === 'listening' && (
          <motion.div
            key={`listening-${cycleIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Breathing ring */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border border-[#4FC3F7]/20 breathe-ring"
                style={{
                  boxShadow: `0 0 ${20 + audioLevel * 40}px rgba(79, 195, 247, ${0.1 + audioLevel * 0.3})`,
                }}
              />
              <div
                className="absolute inset-3 rounded-full border border-[#4FC3F7]/10"
                style={{
                  transform: `scale(${1 + audioLevel * 0.15})`,
                  transition: 'transform 0.1s ease-out',
                }}
              />
              {/* Center mic icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-8 h-8 text-[#4FC3F7]/60"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <path d="M12 19v4m-4 0h8" />
              </svg>
            </div>

            {/* Waveform visualization */}
            <div className="flex items-center justify-center gap-[3px] h-12">
              {waveformValues.map((val, i) => (
                <motion.div
                  key={i}
                  className="w-[2px] rounded-full bg-[#4FC3F7]"
                  style={{
                    height: `${Math.max(4, val * 48)}px`,
                    opacity: 0.3 + val * 0.7,
                  }}
                  transition={{ duration: 0.05 }}
                />
              ))}
            </div>

            {/* Prompt text */}
            <p className="text-white/50 text-xs font-light tracking-wide text-center">
              {PROMPTS[cycleIndex % PROMPTS.length]}
            </p>

            <p className="text-xs tracking-[0.2em] uppercase text-[#4FC3F7]/40 font-light">
              Listening
            </p>
          </motion.div>
        )}

        {/* Thinking */}
        {voiceState === 'thinking' && (
          <motion.div
            key={`thinking-${cycleIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Contracting ring */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border border-[#7C4DFF]/20"
                animate={{
                  scale: [1, 0.9, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  boxShadow: '0 0 30px rgba(124, 77, 255, 0.15)',
                }}
              />
              {/* Center thinking dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#7C4DFF]/60"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs tracking-[0.2em] uppercase text-[#7C4DFF]/40 font-light">
              Processing signal
            </p>
          </motion.div>
        )}

        {/* Complete */}
        {voiceState === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="text-white/70 text-sm font-light tracking-wide">
              Signal analysis complete.
            </p>
            <p className="text-white/40 text-xs font-light tracking-wide mt-2">
              Evaluating alignment...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
