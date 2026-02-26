// ============================================================
// Project Gatekeeper — Device Fingerprinting & Identity
// ============================================================

import { IDENTITY } from './constants';
import type { DeviceRecord } from '@/types';

/**
 * Generate a stable device fingerprint by hashing multiple browser/device signals.
 * This identifies a specific device (not just a browser session).
 */
export function generateFingerprint(): string {
  const signals: string[] = [];

  // Screen dimensions (physical device characteristic)
  signals.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  signals.push(`${window.devicePixelRatio}`);

  // Hardware signals
  signals.push(`cores:${navigator.hardwareConcurrency || 'unknown'}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signals.push(`mem:${(navigator as any).deviceMemory || 'unknown'}`);

  // Platform & language
  signals.push(`plat:${navigator.platform}`);
  signals.push(`lang:${navigator.language}`);
  signals.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

  // WebGL renderer (GPU-specific)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        signals.push(`gpu:${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`);
        signals.push(`vendor:${gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)}`);
      }
    }
  } catch {
    signals.push('gpu:unavailable');
  }

  // Max touch points (device-specific)
  signals.push(`touch:${navigator.maxTouchPoints}`);

  // Hash the combined signals
  return hashString(signals.join('|'));
}

/**
 * Simple but effective string hash (djb2 variant + hex encoding)
 */
function hashString(str: string): string {
  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }
  return (
    (hash1 >>> 0).toString(16).padStart(8, '0') +
    (hash2 >>> 0).toString(16).padStart(8, '0')
  );
}

/**
 * Get the existing device record from localStorage (if any)
 */
export function getDeviceRecord(fingerprint: string): DeviceRecord | null {
  try {
    const stored = localStorage.getItem(IDENTITY.storageKey);
    if (!stored) return null;
    const records: Record<string, DeviceRecord> = JSON.parse(stored);
    return records[fingerprint] || null;
  } catch {
    return null;
  }
}

/**
 * Record a rejection event for this device fingerprint
 */
export function recordRejection(fingerprint: string): void {
  try {
    const stored = localStorage.getItem(IDENTITY.storageKey);
    const records: Record<string, DeviceRecord> = stored ? JSON.parse(stored) : {};
    const existing = records[fingerprint];

    records[fingerprint] = {
      fingerprint,
      rejectedAt: Date.now(),
      attempts: (existing?.attempts || 0) + 1,
      firstSeenAt: existing?.firstSeenAt || Date.now(),
    };

    localStorage.setItem(IDENTITY.storageKey, JSON.stringify(records));
  } catch {
    // localStorage unavailable — silently fail
  }
}

/**
 * Record that a device has started an attempt (without rejection)
 */
export function recordAttempt(fingerprint: string): void {
  try {
    const stored = localStorage.getItem(IDENTITY.storageKey);
    const records: Record<string, DeviceRecord> = stored ? JSON.parse(stored) : {};
    const existing = records[fingerprint];

    if (!existing) {
      records[fingerprint] = {
        fingerprint,
        rejectedAt: null,
        attempts: 1,
        firstSeenAt: Date.now(),
      };
      localStorage.setItem(IDENTITY.storageKey, JSON.stringify(records));
    }
  } catch {
    // localStorage unavailable — silently fail
  }
}

/**
 * Check if a device record is within the rejection cooldown period
 */
export function isWithinCooldown(record: DeviceRecord): boolean {
  if (!record.rejectedAt) return false;
  return Date.now() - record.rejectedAt < IDENTITY.rejectionCooldownMs;
}

/**
 * Get the approximate date when the cooldown expires
 */
export function getCooldownExpiryDate(record: DeviceRecord): Date | null {
  if (!record.rejectedAt) return null;
  return new Date(record.rejectedAt + IDENTITY.rejectionCooldownMs);
}

/**
 * STUB: Check if the current IP has other rejected devices.
 * This will be connected to the backend API in Phase 2.
 * Returns null (no data) until backend is available.
 */
export async function checkIPHistory(): Promise<{
  hasRejectedDevices: boolean;
  rejectedCount: number;
} | null> {
  // TODO: Phase 2 — call backend API endpoint
  // The backend will:
  //   1. Receive the current device fingerprint
  //   2. Look up the request IP
  //   3. Check if other fingerprints from the same IP have been rejected
  //   4. Return the result
  return null;
}
