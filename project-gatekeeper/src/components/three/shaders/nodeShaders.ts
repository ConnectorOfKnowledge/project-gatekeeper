// ============================================================
// Node Particle Shaders — Radial glow with hierarchy-based color
// ============================================================

export const nodeVertexShader = /* glsl */ `
  precision highp float;

  attribute float aHierarchy;
  attribute float aActive;

  uniform float uTime;
  uniform float uPulse;
  uniform float uAudioLevel;
  uniform float uPhaseIntensity;

  varying float vHierarchy;
  varying float vActive;
  varying float vDist;

  void main() {
    vHierarchy = aHierarchy;
    vActive = aActive;

    // Get instance position from instance matrix
    vec4 worldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);

    // Size based on hierarchy, breathing pulse, and audio
    float baseSize = mix(0.04, 0.14, aHierarchy);
    float breathe = 1.0 + uPulse * 0.15 * sin(uTime * 1.8 + aHierarchy * 6.2832);
    float audioBoost = 1.0 + uAudioLevel * 0.4 * aHierarchy;
    float finalSize = baseSize * breathe * audioBoost * max(uPhaseIntensity, 0.01);

    // Billboard: position the quad vertex relative to the instance in view space
    vec4 mvPosition = modelViewMatrix * worldPos;
    mvPosition.xy += position.xy * finalSize;

    vDist = length(worldPos.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const nodeFragmentShader = /* glsl */ `
  precision highp float;

  varying float vHierarchy;
  varying float vActive;
  varying float vDist;

  uniform float uTime;
  uniform vec3 uColorLow;    // deep purple
  uniform vec3 uColorHigh;   // electric blue
  uniform vec3 uColorGold;   // gold accent for "alive" moments
  uniform float uPhaseIntensity;

  void main() {
    // Distance from center of the billboard quad (using UV from position)
    vec2 uv = gl_PointCoord;
    // For instanced plane, use the interpolated position as UV
    float dist = length(uv - vec2(0.5));
    if (dist > 0.5) discard;

    // Radial glow — sharp bright center, soft falloff
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    glow = pow(glow, 1.8);

    // Add a subtle inner core that's extra bright
    float core = 1.0 - smoothstep(0.0, 0.12, dist);
    glow += core * 0.5;

    // Color based on hierarchy: low = purple, high = blue
    vec3 baseColor = mix(uColorLow, uColorHigh, vHierarchy);

    // Gold pulse for active/probed nodes
    float goldPulse = vActive * 0.6 * (0.5 + 0.5 * sin(uTime * 3.5 + vDist));
    vec3 finalColor = mix(baseColor, uColorGold, goldPulse);

    // Brightness from hierarchy and active state
    float alpha = glow * mix(0.35, 1.0, vHierarchy) * mix(0.25, 1.0, vActive * 0.5 + 0.5);
    alpha *= min(uPhaseIntensity, 1.5);

    gl_FragColor = vec4(finalColor * (1.0 + core * 0.8), alpha);
  }
`;
