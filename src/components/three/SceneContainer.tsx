'use client';

// ============================================================
// SceneContainer — Persistent R3F Canvas wrapper
// Never unmounts. Constellation transitions are driven by uniforms.
// Wrapped in CanvasErrorBoundary for graceful WebGL failure.
// ============================================================

import { Canvas } from '@react-three/fiber';
import { WebOfThought } from './WebOfThought';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

export default function SceneContainer() {
  return (
    <div className="fixed inset-0 z-0" style={{ touchAction: 'none' }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          style={{ background: '#000000' }}
        >
          <WebOfThought />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
