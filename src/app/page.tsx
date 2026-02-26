'use client';

// ============================================================
// Project Gatekeeper — Root Page
// Mounts the persistent 3D scene + DOM Experience overlay
// ============================================================

import dynamic from 'next/dynamic';
import { GatekeeperProvider } from '@/context/GatekeeperContext';

// Loading placeholder — shown while Three.js and phase components load
function LoadingVoid() {
  return (
    <div className="fixed inset-0 z-0 bg-black flex items-center justify-center">
      <div className="loading-pulse" />
    </div>
  );
}

// Dynamic imports — Three.js requires `window`, must disable SSR
const SceneContainer = dynamic(
  () => import('@/components/three/SceneContainer'),
  { ssr: false, loading: () => <LoadingVoid /> }
);

const Experience = dynamic(
  () => import('@/components/Experience'),
  { ssr: false }
);

export default function Home() {
  return (
    <GatekeeperProvider>
      <div className="gatekeeper-root">
        {/* Persistent 3D constellation — z-0, behind everything */}
        <SceneContainer />

        {/* DOM overlay — phase components, z-10 */}
        <Experience />
      </div>
    </GatekeeperProvider>
  );
}
