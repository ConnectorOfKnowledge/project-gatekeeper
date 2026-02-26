'use client';

// ============================================================
// Nodes — Instanced glowing particle nodes for the constellation
// Reads smoothed values from shared ref every frame for
// perfectly smooth transitions between phases.
// ============================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { nodeVertexShader, nodeFragmentShader } from './shaders/nodeShaders';
import { THREE_COLORS } from '@/lib/constants';
import type { NodeData } from '@/types';
import type { SmoothedValues } from './WebOfThought';

interface NodesProps {
  nodes: NodeData[];
  smoothedRef: React.RefObject<SmoothedValues>;
  activeNodesRef: React.RefObject<Float32Array>;
}

export function Nodes({ nodes, smoothedRef, activeNodesRef }: NodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const count = nodes.length;

  // Pre-allocate
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Instance attributes
  const { hierarchyArray, originalPositions } = useMemo(() => {
    const hierarchy = new Float32Array(count);
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      hierarchy[i] = nodes[i].hierarchy;
      positions[i * 3] = nodes[i].position[0];
      positions[i * 3 + 1] = nodes[i].position[1];
      positions[i * 3 + 2] = nodes[i].position[2];
    }

    return { hierarchyArray: hierarchy, originalPositions: positions };
  }, [nodes, count]);

  // Create the billboard quad geometry with instance attributes
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    const instancedGeo = new THREE.InstancedBufferGeometry();
    instancedGeo.index = geo.index;
    instancedGeo.attributes.position = geo.attributes.position;
    instancedGeo.attributes.uv = geo.attributes.uv;

    instancedGeo.setAttribute(
      'aHierarchy',
      new THREE.InstancedBufferAttribute(hierarchyArray, 1)
    );
    instancedGeo.setAttribute(
      'aActive',
      new THREE.InstancedBufferAttribute(new Float32Array(count), 1)
    );

    instancedGeo.instanceCount = count;
    return instancedGeo;
  }, [hierarchyArray, count]);

  // Shader material
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: nodeVertexShader,
        fragmentShader: nodeFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPulse: { value: 0 },
          uAudioLevel: { value: 0 },
          uPhaseIntensity: { value: 0 },
          uColorLow: { value: new THREE.Color(THREE_COLORS.deepPurple) },
          uColorHigh: { value: new THREE.Color(THREE_COLORS.electricBlue) },
          uColorGold: { value: new THREE.Color(THREE_COLORS.goldAccent) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    []
  );

  // Set initial instance matrices
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        originalPositions[i * 3],
        originalPositions[i * 3 + 1],
        originalPositions[i * 3 + 2]
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy, originalPositions]);

  // Per-frame updates — read live values from shared ref
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const s = smoothedRef.current;
    if (!s) return;

    const elapsed = state.clock.elapsedTime;

    // Update uniforms from shared ref (live every frame)
    materialRef.current.uniforms.uTime.value = elapsed;
    materialRef.current.uniforms.uPulse.value = s.pulse;
    materialRef.current.uniforms.uAudioLevel.value = s.audioLevel;
    materialRef.current.uniforms.uPhaseIntensity.value = s.intensity;

    // Update active attribute from shared ref
    const activeArr = activeNodesRef.current;
    if (activeArr) {
      const activeAttr = geometry.getAttribute('aActive') as THREE.InstancedBufferAttribute;
      activeAttr.array.set(activeArr);
      activeAttr.needsUpdate = true;
    }

    // Update instance positions for scatter/converge/audio
    const scatterProgress = s.scatter;
    const convergeProgress = s.converge;
    const audioLevel = s.audioLevel;

    for (let i = 0; i < count; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const oz = originalPositions[i * 3 + 2];

      let px = ox;
      let py = oy;
      let pz = oz;

      // Scatter: push outward
      if (scatterProgress > 0.001) {
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
        const nx = ox / len;
        const ny = oy / len;
        const nz = oz / len;
        const scatterDist = scatterProgress * 15 * (0.5 + nodes[i].hierarchy);
        px += nx * scatterDist;
        py += ny * scatterDist;
        pz += nz * scatterDist;
      }

      // Converge: pull toward center
      if (convergeProgress > 0.001) {
        px = THREE.MathUtils.lerp(px, 0, convergeProgress * 0.9);
        py = THREE.MathUtils.lerp(py, 0, convergeProgress * 0.9);
        pz = THREE.MathUtils.lerp(pz, 0, convergeProgress * 0.9);
      }

      // Audio displacement: push outward proportional to level and hierarchy
      if (audioLevel > 0.01) {
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
        const displacement = audioLevel * nodes[i].hierarchy * 0.6;
        px += (ox / len) * displacement;
        py += (oy / len) * displacement;
        pz += (oz / len) * displacement;
      }

      dummy.position.set(px, py, pz);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    >
      <primitive object={material} ref={materialRef} attach="material" />
    </instancedMesh>
  );
}
