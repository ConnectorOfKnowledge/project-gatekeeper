'use client';

import { useState, useEffect } from 'react';
import {
  generateFingerprint,
  getDeviceRecord,
  isWithinCooldown,
  getCooldownExpiryDate,
} from '@/lib/deviceIdentity';
import type { DeviceRecord } from '@/types';

interface DeviceFingerprintResult {
  fingerprint: string | null;
  record: DeviceRecord | null;
  isBlocked: boolean;
  cooldownExpiry: Date | null;
  isLoading: boolean;
}

/**
 * Generate device fingerprint on mount and check for existing records.
 */
export function useDeviceFingerprint(): DeviceFingerprintResult {
  const [result, setResult] = useState<DeviceFingerprintResult>({
    fingerprint: null,
    record: null,
    isBlocked: false,
    cooldownExpiry: null,
    isLoading: true,
  });

  useEffect(() => {
    const fp = generateFingerprint();
    const record = getDeviceRecord(fp);
    const blocked = record ? isWithinCooldown(record) : false;
    const expiry = record ? getCooldownExpiryDate(record) : null;

    setResult({
      fingerprint: fp,
      record,
      isBlocked: blocked,
      cooldownExpiry: expiry,
      isLoading: false,
    });
  }, []);

  return result;
}
