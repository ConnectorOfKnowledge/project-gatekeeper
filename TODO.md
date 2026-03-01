# TODO

## In Progress
- [ ] Real-device testing on iPhone and Android — document any visual or interaction bugs

## Up Next
- [ ] Phase 2 architecture: design Gemini API integration for voice interaction phase
- [ ] Backend API: IP history checking endpoint (stub exists in `src/lib/deviceIdentity.ts`)
- [ ] Backend API: submission storage for name/phone from acceptance phase
- [ ] Decide on real speed test vs. keeping theatrical simulation
- [ ] Add haptic feedback (navigator.vibrate) at key phase transitions
- [ ] Performance optimization: split React context or migrate to zustand to avoid per-frame re-renders
- [ ] Add analytics/telemetry for tracking how far visitors get in the gauntlet
- [ ] Accessibility review: ensure rejection/acceptance paths are screen-reader navigable
- [ ] SEO/OG meta tags for link previews when sharing the URL

## Up Next (Creative / Visual)
- [ ] Tune constellation transition timing after real-device testing
- [ ] Add subtle particle trails or comet effects to high-hierarchy nodes
- [ ] Explore post-processing effects (bloom, chromatic aberration) via @react-three/postprocessing
- [ ] Design a more elaborate acceptance ceremony (constellation convergence animation)
- [ ] Sound design: ambient tones, phase transition sounds, rejection/acceptance audio cues

## Done (recent)
- [x] 2026-02-26: Deployed to Vercel — live at https://project-gatekeeper.vercel.app
- [x] 2026-02-26: Committed to GitHub — https://github.com/ConnectorOfKnowledge/project-gatekeeper
- [x] 2026-02-26: Phase 8 polish — iOS notch support, loading states, touch hardening, input zoom prevention
- [x] 2026-02-26: Phase 8 bug fixes — SpeedTest closure bug, shared ref pattern for R3F, error boundary
- [x] 2026-02-26: Phases 0-5 — Full project scaffold, state machine, 3D constellation, all phase components, build passing
