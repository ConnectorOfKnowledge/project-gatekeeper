// ============================================================
// Project Gatekeeper — Constants & Configuration
// ============================================================

export const COLORS = {
  electricBlue: '#4FC3F7',
  deepBlue: '#0288D1',
  vividPurple: '#7C4DFF',
  deepPurple: '#4A148C',
  goldAccent: '#FFD54F',
  void: '#000000',
  white: '#FFFFFF',
  dimWhite: '#8A8A8A',
} as const;

export const THREE_COLORS = {
  electricBlue: 0x4fc3f7,
  deepBlue: 0x0288d1,
  vividPurple: 0x7c4dff,
  deepPurple: 0x4a148c,
  goldAccent: 0xffd54f,
} as const;

export const CONSTELLATION = {
  nodeCount: 150,
  connectionThreshold: 2.8,
  hubProbability: 0.08,
  hubMinConnections: 5,
  normalMaxConnections: 4,
  breathingSpeed: 0.3,
  breathingAmplitude: 0.15,
  sphereRadius: 5,
  sphereDepthVariation: 0.6,
  seed: 42,
} as const;

export const SPEED_TEST = {
  latencyRange: [12, 42] as [number, number],
  downloadRange: [65, 220] as [number, number],
  uploadRange: [15, 55] as [number, number],
  latencyDuration: 2200,
  downloadDuration: 3200,
  uploadDuration: 2800,
  staggerDelay: 1200,
} as const;

export const TIMING = {
  entryHoldDuration: 3500,
  entrySecondLineDuration: 2000,
  permissionGap: 1500,
  voiceListenDuration: 8000,
  voiceThinkDuration: 4000,
  voiceCycles: 3,
  rejectionFadeDuration: 2000,
  acceptanceConvergeDuration: 3000,
  returningCheckDelay: 1000,
  phaseTransitionDuration: 600,
} as const;

export const IDENTITY = {
  rejectionCooldownMs: 6 * 30 * 24 * 60 * 60 * 1000, // ~6 months
  storageKey: 'gatekeeper_identity',
} as const;

// Phase-driven constellation behavior targets
export const PHASE_TARGETS = {
  DEVICE_CHECK:    { intensity: 0.0,  pulseSpeed: 0.2, fade: 1.0, scatter: 0.0, converge: 0.0 },
  RETURNING_CHECK: { intensity: 0.15, pulseSpeed: 0.2, fade: 1.0, scatter: 0.0, converge: 0.0 },
  ENTRY:           { intensity: 0.3,  pulseSpeed: 0.3, fade: 1.0, scatter: 0.0, converge: 0.0 },
  SPEED_TEST:      { intensity: 0.8,  pulseSpeed: 0.8, fade: 1.0, scatter: 0.0, converge: 0.0 },
  CALIBRATION:     { intensity: 0.6,  pulseSpeed: 0.4, fade: 1.0, scatter: 0.0, converge: 0.0 },
  VOICE_INTERFACE: { intensity: 1.0,  pulseSpeed: 0.5, fade: 1.0, scatter: 0.0, converge: 0.0 },
  REJECTION:       { intensity: 0.0,  pulseSpeed: 0.0, fade: 0.0, scatter: 1.0, converge: 0.0 },
  ACCEPTANCE:      { intensity: 1.5,  pulseSpeed: 1.0, fade: 1.0, scatter: 0.0, converge: 1.0 },
} as const;
