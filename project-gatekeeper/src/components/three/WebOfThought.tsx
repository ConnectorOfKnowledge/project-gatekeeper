'use client';

// ============================================================
// WebOfThought — Main 3D constellation orchestrator
// Reads phase state, drives uniforms, manages transitions.
// Smoothed values live in refs and are shared with children
// so they read live data every frame (not stale render-time props).
// ============================================================

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Nodes } from './Nodes';
import { Filaments } from './Filaments';
import { generateConstellation } from '@/lib/constellation';
import { PHASE_TARGETS, CONSTELLATION } from '@/lib/constants';
import { useGatekeeper } from '@/context/GatekeeperContext';

// Lerp helper
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Shared ref shape — children read these in their own useFrame */
export interface SmoothedValues {
  intensity: number;
  pulseSpeed: number;
  fade: number;
  scatter: number;
  converge: number;
  pulse: number;
  audioLevel: number;
}

export function WebOfThought() {
  const { state } = useGatekeeper();
  const { phase, audioLevel, gyroscopeData } = state;

  // Generate constellation once
  const constellation = useMemo(() => generateConstellation(), []);
  const { nodes, edges } = constellation;

  // Active nodes array (updated per frame for probing/highlighting)
  const activeNodesRef = useRef(new Float32Array(nodes.length).fill(0));

  // Smoothed phase-driven values — shared ref, children read .current
  const smoothedRef = useRef<SmoothedValues>({
    intensity: 0,
    pulseSpeed: 0.2,
    fade: 1.0,
    scatter: 0,
    converge: 0,
    pulse: 0,
    audioLevel: 0,
  });

  // Speed test probe position
  const probeRef = useRef({ x: -5, y: 0, z: 0, active: false });

  // Camera offset target for gyroscope
  const cameraTarget = useRef({ x: 0, y: 0 });

  useFrame((frameState) => {
    const elapsed = frameState.clock.elapsedTime;
    const targets = PHASE_TARGETS[phase];
    const lerpSpeed = 0.03;
    const s = smoothedRef.current;

    // Smooth toward phase targets
    s.intensity = lerp(s.intensity, targets.intensity, lerpSpeed);
    s.pulseSpeed = lerp(s.pulseSpeed, targets.pulseSpeed, lerpSpeed);
    s.fade = lerp(s.fade, targets.fade, lerpSpeed);
    s.scatter = lerp(s.scatter, targets.scatter, lerpSpeed * 1.5);
    s.converge = lerp(s.converge, targets.converge, lerpSpeed);

    // Breathing pulse (continuous sine wave)
    s.pulse = Math.sin(elapsed * CONSTELLATION.breathingSpeed * Math.PI * 2) * 0.5 + 0.5;

    // Forward audio level so children can read it from the same ref
    s.audioLevel = audioLevel;

    // === Speed Test Probing ===
    if (phase === 'SPEED_TEST') {
      probeRef.current.active = true;
      const probeSpeed = 1.2;
      probeRef.current.x = Math.sin(elapsed * probeSpeed) * 4;
      probeRef.current.y = Math.cos(elapsed * probeSpeed * 0.7) * 3;
      probeRef.current.z = Math.sin(elapsed * probeSpeed * 0.5) * 3;
    } else {
      probeRef.current.active = false;
    }

    // Update active nodes
    for (let i = 0; i < nodes.length; i++) {
      if (probeRef.current.active) {
        const dx = nodes[i].position[0] - probeRef.current.x;
        const dy = nodes[i].position[1] - probeRef.current.y;
        const dz = nodes[i].position[2] - probeRef.current.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const activation = Math.max(0, 1 - dist / 3);
        activeNodesRef.current[i] = lerp(activeNodesRef.current[i], activation, 0.1);
      } else if (phase === 'VOICE_INTERFACE') {
        activeNodesRef.current[i] = lerp(
          activeNodesRef.current[i],
          audioLevel * (0.3 + nodes[i].hierarchy * 0.7),
          0.15
        );
      } else if (phase === 'ACCEPTANCE') {
        activeNodesRef.current[i] = lerp(activeNodesRef.current[i], 0.8, 0.02);
      } else {
        activeNodesRef.current[i] = lerp(activeNodesRef.current[i], 0, 0.05);
      }
    }

    // === Gyroscope Camera Offset ===
    cameraTarget.current.x = gyroscopeData.gamma * 0.02;
    cameraTarget.current.y = gyroscopeData.beta * 0.02;

    frameState.camera.position.x = lerp(
      frameState.camera.position.x,
      cameraTarget.current.x,
      0.04
    );
    frameState.camera.position.y = lerp(
      frameState.camera.position.y,
      cameraTarget.current.y,
      0.04
    );
    frameState.camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <Nodes
        nodes={nodes}
        smoothedRef={smoothedRef}
        activeNodesRef={activeNodesRef}
      />
      <Filaments
        nodes={nodes}
        edges={edges}
        smoothedRef={smoothedRef}
      />
    </group>
  );
}
