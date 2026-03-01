// ============================================================
// Project Gatekeeper — Core Type Definitions
// ============================================================

export type Phase =
  | 'DEVICE_CHECK'
  | 'RETURNING_CHECK'
  | 'ENTRY'
  | 'SPEED_TEST'
  | 'CALIBRATION'
  | 'VOICE_INTERFACE'
  | 'REJECTION'
  | 'ACCEPTANCE';

export type PermissionType = 'microphone' | 'motion' | 'location';
export type PermissionStatus = 'pending' | 'granted' | 'denied';

export interface SpeedTestResult {
  latency: number;
  download: number;
  upload: number;
}

export interface GyroscopeData {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface DeviceRecord {
  fingerprint: string;
  rejectedAt: number | null;
  attempts: number;
  firstSeenAt: number;
}

export interface GatekeeperState {
  phase: Phase;
  permissions: Record<PermissionType, PermissionStatus>;
  speedTestResult: SpeedTestResult | null;
  audioLevel: number;
  gyroscopeData: GyroscopeData;
  userName: string;
  userPhone: string;
  isTransitioning: boolean;
  deviceFingerprint: string | null;
  micStream: MediaStream | null;
}

export type GatekeeperAction =
  | { type: 'SET_PHASE'; payload: Phase }
  | { type: 'SET_PERMISSION'; payload: { permission: PermissionType; status: PermissionStatus } }
  | { type: 'SET_SPEED_RESULT'; payload: SpeedTestResult }
  | { type: 'SET_AUDIO_LEVEL'; payload: number }
  | { type: 'SET_GYROSCOPE'; payload: GyroscopeData }
  | { type: 'SET_USER_DATA'; payload: { name: string; phone: string } }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'SET_FINGERPRINT'; payload: string }
  | { type: 'SET_MIC_STREAM'; payload: MediaStream | null };

export interface NodeData {
  position: [number, number, number];
  hierarchy: number;
  connections: number;
}

export interface EdgeData {
  from: number;
  to: number;
  length: number;
}

export interface ConstellationData {
  nodes: NodeData[];
  edges: EdgeData[];
}
