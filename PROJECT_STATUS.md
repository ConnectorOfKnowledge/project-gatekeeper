# Project Gatekeeper - Project Status
**Last Updated:** 2026-02-26
**Current Phase:** Phase 1 complete (frontend framework). Ready for Phase 2 (backend/AI integration).

## Tech Stack
- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **UI:** React 19.2.3, Tailwind CSS v4 (`@import "tailwindcss"` + `@theme inline`, NOT `tailwind.config.ts`)
- **3D:** React Three Fiber 9.5.0, @react-three/drei 10.7.7, Three.js 0.183.1
- **Animation:** Framer Motion v12.34.3 (stricter types - `ease` must use `as const`)
- **Shaders:** Custom GLSL stored as TypeScript string exports (not .glsl files)
- **Deployment:** Vercel (auto-deploy from GitHub on push)
- **Repo:** https://github.com/ConnectorOfKnowledge/project-gatekeeper (public)
- **Live URL:** https://project-gatekeeper.vercel.app

## Architecture Overview
Project Gatekeeper is a mobile-only, high-fidelity "Initiation" landing page for a web design business. Visitors are gated through a multi-step "Gauntlet" flow: device check, returning user check, entry, speed test, permissions calibration, voice interaction, then acceptance or rejection. A persistent 3D neural network constellation ("Web of Thought") is the visual centerpiece that responds to phase transitions, audio input, and device orientation. The entire app is a single Next.js page with a React Context state machine driving phase transitions, a persistent R3F Canvas that never unmounts, and DOM overlays animated with Framer Motion's AnimatePresence.

## What's Working
- [x] Mobile device detection gate (desktop visitors see "Mobile Device Required" screen with floating particles)
- [x] Device fingerprinting (WebGL + screen + UA + timezone hash via djb2)
- [x] Returning user detection (localStorage, 6-month rejection cooldown)
- [x] Entry phase with cinematic text reveal (GlowText character-by-character animation)
- [x] Simulated speed test with animated gauge (latency/download/upload with realistic curves)
- [x] Calibration phase (sequential permission requests for microphone + gyroscope)
- [x] iOS 13+ DeviceOrientationEvent.requestPermission() handling
- [x] Voice interface phase (audio visualizer ring, stub callbacks for Gemini API)
- [x] Acceptance phase (name + phone form with frosted glass card)
- [x] Rejection phase (ominous messaging, localStorage ban with 6-month expiry)
- [x] 3D constellation with 150+ instanced nodes (single draw call) and batched filaments
- [x] Custom GLSL shaders (radial glow nodes with hierarchy coloring, energy pulse filaments)
- [x] Phase-driven constellation transitions (intensity, scatter, converge, pulse speed via uniforms)
- [x] Audio-reactive constellation distortion (Web Audio API AnalyserNode)
- [x] Gyroscope parallax with auto-orbit fallback when no device events
- [x] Shared ref pattern for R3F parent-child 60fps communication
- [x] R3F error boundary with graceful fallback (breathing dot)
- [x] Loading states for dynamic imports
- [x] iOS safe area support (viewport-fit: cover, safe-bottom padding)
- [x] Apple web app standalone mode support
- [x] Touch hardening (no context menu, no text selection except inputs, touch-action: none on canvas)
- [x] Input zoom prevention (font-size: max(16px, 1em))
- [ ] Backend API for IP history checking (stub exists in deviceIdentity.ts)
- [ ] Gemini API integration for voice interaction (stub callbacks in VoicePhase.tsx)
- [ ] Real speed test against actual server endpoints
- [ ] Admin dashboard for viewing submissions

## Known Bugs / Blockers
1. **Performance note (not blocking):** `SET_AUDIO_LEVEL` and `SET_GYROSCOPE` dispatches fire every animation frame, causing unnecessary re-renders of context consumers. Acceptable for Phase 1 since only one phase component mounts at a time and visual updates happen in useFrame. For production, should split context or migrate to zustand.
2. **Speed test is simulated:** Uses random target values with realistic easing curves, not actual network measurement. Adequate for the "theater" of Phase 1 but needs real endpoints for Phase 2.
3. **Voice phase is stub-only:** The microphone captures audio and drives the visualizer, but there's no AI processing. `onSpeechStart`, `onSpeechEnd`, and `onAIResponse` callbacks are ready for Gemini integration.

## Recent Changes (last 2-3 sessions)
- **2026-02-26 (Session 3):** Phase 8 polish complete. Added iOS notch support (viewport-fit: cover), apple-mobile-web-app meta, loading fallbacks for dynamic imports, touch-action hardening, context menu prevention, input zoom prevention, safe-insets utility. Deployed to Vercel. Committed to GitHub.
- **2026-02-26 (Session 2):** Phase 8 critical bug fixes. Fixed SpeedTest closure bug (onComplete now receives values as args). Rewrote WebOfThought/Nodes/Filaments to use shared ref pattern for 60fps updates. Added CanvasErrorBoundary around R3F Canvas.
- **2026-02-26 (Session 1):** Phases 0-5 complete. Full project scaffold, state machine, 3D constellation with custom shaders, all 7 phase components, build passing. Fixed Framer Motion v12 ease type errors, navigator.deviceMemory type error.

## Key Design Decisions (and WHY)
- **Mobile-only gate:** The experience is designed for intimate, handheld interaction. Desktop visitors see a minimal "return on your phone" screen. This is intentional brand positioning, not a limitation.
- **Persistent R3F Canvas:** The 3D constellation never unmounts. Phase transitions are driven by interpolating shader uniforms, not by mounting/unmounting Three.js scenes. This prevents expensive WebGL context recreation and enables smooth visual transitions.
- **Shared ref pattern for R3F:** Parent (WebOfThought) updates smoothed values in a shared ref during useFrame. Children (Nodes, Filaments) read from the same ref in their own useFrame. This avoids stale JSX props (which only update on React re-renders) and ensures 60fps data flow.
- **InstancedMesh for nodes, batched LineSegments for filaments:** Single draw call each. Critical for mobile GPU performance with 150+ particles and hundreds of edges.
- **Fibonacci sphere with jitter:** Nodes are distributed on a Fibonacci sphere (golden angle spacing) with random jitter. This produces organic, non-uniform clustering that looks natural rather than gridded.
- **Seeded PRNG (Mulberry32):** Constellation generation uses a seeded random number generator so the same seed always produces the same constellation. Enables deterministic visual identity.
- **Simulated speed test:** Phase 1 uses theatrical fake values. The "speed test" is about the ceremony of being evaluated, not actual measurement. Real endpoints come in Phase 2.
- **6-month rejection cooldown:** Rejected visitors are banned via localStorage with a timestamp. After 6 months the ban expires and they can retry. Harsh but thematic.
- **Tailwind CSS v4 syntax:** Uses `@import "tailwindcss"` and `@theme inline {}` blocks. There is NO `tailwind.config.ts` file. This is the v4 way.
- **Framer Motion v12 strict types:** All `ease` tuples must have `as const` assertion. All `Variants` objects should use the `Variants` type import from framer-motion.
- **GLSL as TypeScript strings:** Shaders are stored as `export const` string templates in `.ts` files, not separate `.glsl` files. This avoids loader config complexity and keeps shader code co-located with the components that use them.

## Gemini's Last Update Summary
N/A - No Gemini sessions yet.

## Answers to Gemini's Questions
N/A

## Next Session TODO
1. Test the full flow on real mobile devices (iPhone, Android) and document any issues
2. Begin Phase 2 planning: Gemini API integration architecture for voice interaction
3. Design the backend API for IP history checking and submission storage
4. Consider real speed test implementation (or decide if theatrical version is sufficient)
5. Explore adding haptic feedback (navigator.vibrate) at key moments
