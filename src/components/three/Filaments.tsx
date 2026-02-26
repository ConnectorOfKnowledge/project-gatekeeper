'use client';

// ============================================================
// Filaments — Batched line segments with energy pulse shader
// Reads smoothed values from shared ref every frame for
// perfectly smooth transitions between phases.
// ============================================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { filamentVertexShader, filamentFragmentShader } from './shaders/filamentShaders';
import { THREE_COLORS } from '@/lib/constants';
import type { NodeData, EdgeData } from '@/types';
import type { SmoothedValues } from './WebOfThought';

interface FilamentsProps {
  nodes: NodeData[];
  edges: EdgeData[];
  smoothedRef: React.RefObject<SmoothedValues>;
}

export function Filaments({ nodes, edges, smoothedRef }: FilamentsProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Build batched geometry: 2 vertices per edge
  const { geometry, positionAttr } = useMemo(() => {
    const vertexCount = edges.length * 2;
    const positions = new Float32Array(vertexCount * 3);
    const progress = new Float32Array(vertexCount);
    const edgeIndex = new Float32Array(vertexCount);

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const fromNode = nodes[edge.from];
      const toNode = nodes[edge.to];

      // Vertex 1: from
      positions[i * 6] = fromNode.position[0];
      positions[i * 6 + 1] = fromNode.position[1];
      positions[i * 6 + 2] = fromNode.position[2];
      progress[i * 2] = 0;
      edgeIndex[i * 2] = i;

      // Vertex 2: to
      positions[i * 6 + 3] = toNode.position[0];
      positions[i * 6 + 4] = toNode.position[1];
      positions[i * 6 + 5] = toNode.position[2];
      progress[i * 2 + 1] = 1;
      edgeIndex[i * 2 + 1] = i;
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1));
    geo.setAttribute('aEdgeIndex', new THREE.BufferAttribute(edgeIndex, 1));

    return { geometry: geo, positionAttr: posAttr };
  }, [nodes, edges]);

  // Shader material
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: filamentVertexShader,
        fragmentShader: filamentFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPulseSpeed: { value: 0.3 },
          uFade: { value: 1.0 },
          uBaseColor: { value: new THREE.Color(THREE_COLORS.deepBlue) },
          uPulseColor: { value: new THREE.Color(THREE_COLORS.electricBlue) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  // Per-frame updates — read live values from shared ref
  useFrame((state) => {
    if (!materialRef.current) return;
    const s = smoothedRef.current;
    if (!s) return;

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uPulseSpeed.value = s.pulseSpeed;
    materialRef.current.uniforms.uFade.value = s.fade;

    const scatterProgress = s.scatter;
    const convergeProgress = s.converge;

    // Update positions for scatter/converge
    if (scatterProgress > 0.001 || convergeProgress > 0.001) {
      const positions = positionAttr.array as Float32Array;

      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];

        for (let v = 0; v < 2; v++) {
          const node = v === 0 ? fromNode : toNode;
          const [ox, oy, oz] = node.position;
          let px = ox, py = oy, pz = oz;

          if (scatterProgress > 0.001) {
            const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
            const dist = scatterProgress * 15 * (0.5 + node.hierarchy);
            px += (ox / len) * dist;
            py += (oy / len) * dist;
            pz += (oz / len) * dist;
          }

          if (convergeProgress > 0.001) {
            px = THREE.MathUtils.lerp(px, 0, convergeProgress * 0.9);
            py = THREE.MathUtils.lerp(py, 0, convergeProgress * 0.9);
            pz = THREE.MathUtils.lerp(pz, 0, convergeProgress * 0.9);
          }

          const idx = (i * 2 + v) * 3;
          positions[idx] = px;
          positions[idx + 1] = py;
          positions[idx + 2] = pz;
        }
      }
      positionAttr.needsUpdate = true;
    }
  });

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <primitive object={material} ref={materialRef} attach="material" />
    </lineSegments>
  );
}
