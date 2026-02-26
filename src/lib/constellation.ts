// ============================================================
// Project Gatekeeper — Constellation Generation Algorithm
// ============================================================
// Generates a neural-network-like 3D constellation using
// seeded random distribution with spherical mapping.
// ============================================================

import { CONSTELLATION } from './constants';
import type { NodeData, EdgeData, ConstellationData } from '@/types';

/**
 * Seeded pseudo-random number generator (Mulberry32)
 */
function createRNG(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate the full constellation: nodes + edges
 */
export function generateConstellation(
  config = CONSTELLATION
): ConstellationData {
  const rng = createRNG(config.seed);
  const nodes = generateNodes(rng, config);
  const edges = generateEdges(nodes, config);
  return { nodes, edges };
}

/**
 * Generate node positions using spherical distribution
 * with organic clustering (not purely random)
 */
function generateNodes(
  rng: () => number,
  config: typeof CONSTELLATION
): NodeData[] {
  const nodes: NodeData[] = [];
  const { nodeCount, sphereRadius, sphereDepthVariation, hubProbability } = config;

  for (let i = 0; i < nodeCount; i++) {
    // Fibonacci sphere distribution for even coverage
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);

    // Add randomness to break the pattern
    const thetaJitter = theta + (rng() - 0.5) * 0.8;
    const phiJitter = phi + (rng() - 0.5) * 0.3;

    // Vary the radius for depth
    const radiusVariation = 1 - sphereDepthVariation / 2 + rng() * sphereDepthVariation;
    const r = sphereRadius * radiusVariation;

    const x = r * Math.sin(phiJitter) * Math.cos(thetaJitter);
    const y = r * Math.sin(phiJitter) * Math.sin(thetaJitter);
    const z = r * Math.cos(phiJitter);

    // Determine hierarchy: hub nodes are larger and brighter
    const isHub = rng() < hubProbability;
    const hierarchy = isHub
      ? 0.7 + rng() * 0.3  // Hub: 0.7 - 1.0
      : 0.1 + rng() * 0.4; // Normal: 0.1 - 0.5

    nodes.push({
      position: [x, y, z],
      hierarchy,
      connections: 0,
    });
  }

  return nodes;
}

/**
 * Generate edges between nearby nodes, respecting connection limits
 */
function generateEdges(
  nodes: NodeData[],
  config: typeof CONSTELLATION
): EdgeData[] {
  const { connectionThreshold, hubMinConnections, normalMaxConnections } = config;
  const candidateEdges: EdgeData[] = [];

  // Find all candidate edges within threshold distance
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].position[0] - nodes[j].position[0];
      const dy = nodes[i].position[1] - nodes[j].position[1];
      const dz = nodes[i].position[2] - nodes[j].position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < connectionThreshold) {
        candidateEdges.push({ from: i, to: j, length: dist });
      }
    }
  }

  // Sort by distance (prefer shorter connections)
  candidateEdges.sort((a, b) => a.length - b.length);

  // Build edge list respecting connection limits
  const connectionCount = new Array(nodes.length).fill(0);
  const finalEdges: EdgeData[] = [];

  for (const edge of candidateEdges) {
    const fromNode = nodes[edge.from];
    const toNode = nodes[edge.to];

    const fromIsHub = fromNode.hierarchy >= 0.7;
    const toIsHub = toNode.hierarchy >= 0.7;

    const fromLimit = fromIsHub ? hubMinConnections + 4 : normalMaxConnections;
    const toLimit = toIsHub ? hubMinConnections + 4 : normalMaxConnections;

    if (connectionCount[edge.from] < fromLimit && connectionCount[edge.to] < toLimit) {
      finalEdges.push(edge);
      connectionCount[edge.from]++;
      connectionCount[edge.to]++;
    }
  }

  // Update node connection counts
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].connections = connectionCount[i];
  }

  return finalEdges;
}
