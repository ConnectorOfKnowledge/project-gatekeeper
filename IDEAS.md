# IDEAS
## Feature parking lot - interesting but not committed to the TODO.

## Feature Ideas
- **Constellation memory:** Return visitors who passed previously see their unique constellation seed again, as if the system "remembers" them. Different seed = different visual identity.
- **Multi-stage rejection escalation:** First rejection is stern but hopeful ("return when conditions improve"). Second attempt within cooldown is colder. Third is cryptic and final.
- **Invitation codes:** Allow existing "accepted" users to generate single-use invite codes that bypass certain gauntlet stages for referrals.
- **Time-of-day theming:** Constellation color palette shifts based on local time — warmer golds at sunset, cooler blues at night, ethereal purples at dawn.
- **Heartbeat detection:** Use the phone camera + flashlight to detect pulse via fingertip PPG. Feed heart rate into constellation as another biometric input.
- **Progressive revelation:** After acceptance, the constellation slowly reveals hidden patterns or messages over repeated visits — rewarding loyalty.
- **Device capability scoring:** Use actual WebGL capabilities, screen resolution, and device memory to create a "worthiness" score that influences the gauntlet's difficulty.
- **Shared constellation moment:** Two accepted users visiting simultaneously could see their constellations briefly merge or interact.

## Technical Explorations
- **Gemini multimodal voice:** Investigate Gemini's real-time audio streaming API for natural voice conversation during the voice phase. Need to evaluate latency, cost, and the quality of the "personality" we can achieve.
- **Edge functions for IP check:** Vercel Edge Functions could handle IP history checking with low latency. Evaluate whether a simple KV store (Vercel KV / Upstash Redis) is sufficient or if we need a proper database.
- **WebGPU migration:** Three.js has experimental WebGPU support. Could dramatically improve particle count and shader complexity on supported devices. Not ready for production yet, but worth monitoring.
- **WASM audio processing:** For more sophisticated audio analysis (pitch detection, speech-to-text preprocessing), consider a WASM module running in an AudioWorklet.
- **Spatial audio:** Use the Web Audio API's PannerNode to create 3D positional audio that corresponds to constellation node positions. Headphone-only feature.
- **Lottie animations:** For the phase transition UI elements (checkmarks, loading indicators), Lottie could provide richer micro-animations than pure CSS/Framer Motion.
