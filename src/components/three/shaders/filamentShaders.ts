// ============================================================
// Filament (Edge) Shaders — Energy pulse traveling along connections
// ============================================================

export const filamentVertexShader = /* glsl */ `
  precision highp float;

  attribute float aProgress;
  attribute float aEdgeIndex;

  uniform float uTime;
  uniform float uPulseSpeed;
  uniform float uFade;

  varying float vProgress;
  varying float vEdgeIndex;

  void main() {
    vProgress = aProgress;
    vEdgeIndex = aEdgeIndex;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const filamentFragmentShader = /* glsl */ `
  precision highp float;

  varying float vProgress;
  varying float vEdgeIndex;

  uniform float uTime;
  uniform float uPulseSpeed;
  uniform float uFade;
  uniform vec3 uBaseColor;    // deep blue
  uniform vec3 uPulseColor;   // electric blue

  void main() {
    // Each edge gets a slightly different phase offset based on its index
    float edgeOffset = fract(vEdgeIndex * 0.618033988); // golden ratio for variety

    // Energy pulse traveling along the edge
    float t = fract(uTime * uPulseSpeed * 0.3 - vProgress + edgeOffset);

    // Smooth pulse shape — a bright spot that moves along the edge
    float pulse = smoothstep(0.0, 0.08, t) * smoothstep(0.25, 0.08, t);

    // Secondary, dimmer pulse for visual richness
    float t2 = fract(uTime * uPulseSpeed * 0.2 + vProgress * 0.7 + edgeOffset * 0.5);
    float pulse2 = smoothstep(0.0, 0.06, t2) * smoothstep(0.18, 0.06, t2) * 0.4;

    // Combine
    float totalPulse = max(pulse, pulse2);

    // Base line visibility (always slightly visible when not fading)
    float baseBrightness = 0.08;
    float brightness = baseBrightness + totalPulse * 0.92;

    // Color: base when dim, pulse color when bright
    vec3 color = mix(uBaseColor, uPulseColor, totalPulse);

    // Final alpha with fade control
    float alpha = brightness * uFade * 0.7;

    gl_FragColor = vec4(color, alpha);
  }
`;
