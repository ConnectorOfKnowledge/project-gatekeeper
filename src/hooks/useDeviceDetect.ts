'use client';

import { useState, useEffect } from 'react';

/**
 * Detect whether the current device is mobile.
 * Returns null during SSR/initial render, then boolean once determined.
 */
export function useDeviceDetect(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const mobileUA = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
        navigator.userAgent
      );
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const narrow = window.innerWidth <= 1024;

      // Must have touch AND (mobile UA OR narrow screen)
      setIsMobile(hasTouch && (mobileUA || narrow));
    };

    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}
