'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioAnalysis {
  audioLevel: number;          // 0-1 RMS
  frequencyData: Uint8Array | null;
  bassLevel: number;           // 0-1
  trebleLevel: number;         // 0-1
}

/**
 * Analyze microphone input in real-time via Web Audio API.
 * Returns normalized audio level and frequency data for driving visuals.
 */
export function useAudioAnalyzer(stream: MediaStream | null): AudioAnalysis {
  const [analysis, setAnalysis] = useState<AudioAnalysis>({
    audioLevel: 0,
    frequencyData: null,
    bassLevel: 0,
    trebleLevel: 0,
  });

  const contextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();

    analyzer.fftSize = 256;
    analyzer.smoothingTimeConstant = 0.75;

    source.connect(analyzer);

    contextRef.current = audioContext;
    analyzerRef.current = analyzer;

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const tick = () => {
      analyzer.getByteFrequencyData(dataArray);

      // Overall RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length) / 255;

      // Bass level (first 10 bins ~ 0-860Hz)
      let bassSum = 0;
      const bassBins = Math.min(10, dataArray.length);
      for (let i = 0; i < bassBins; i++) {
        bassSum += dataArray[i];
      }
      const bass = bassSum / (bassBins * 255);

      // Treble level (bins 50+ ~ 4300Hz+)
      let trebleSum = 0;
      const trebleStart = Math.min(50, dataArray.length);
      const trebleBins = dataArray.length - trebleStart;
      for (let i = trebleStart; i < dataArray.length; i++) {
        trebleSum += dataArray[i];
      }
      const treble = trebleBins > 0 ? trebleSum / (trebleBins * 255) : 0;

      setAnalysis({
        audioLevel: rms,
        frequencyData: new Uint8Array(dataArray),
        bassLevel: bass,
        trebleLevel: treble,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    // Resume audio context (required after user gesture on iOS)
    audioContext.resume().then(() => {
      rafRef.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      audioContext.close();
    };
  }, [stream]);

  return analysis;
}
