# The Mirror — Digital Clone System

## What This Is

The Mirror is a personal AI clone — a digital copy of a specific person (Lonnie). It's not an assistant, not a chatbot, not a task runner. It IS the person, digitally. The goal is that someone could talk to The Mirror and not be able to tell the difference between the clone and the real person.

## Architecture

### Identity Core (`src/core/identity.ts`)
- Loads/saves identity profile files from `identity/` directory
- Six sections: personality, knowledge, beliefs, patterns, history, growthJournal
- Files are Markdown — human-readable, human-editable, machine-updatable

### Cognitive Engine (`src/core/engine.ts`)
- Builds system prompts that make Claude BE the person (not play them)
- Two modes: Conversation (full character) and Growth (learning mode)
- Streams responses via SSE
- Parses `<identity_update>` tags from growth sessions and applies them

### Growth Interface
- **Q&A Mode**: The clone asks questions, the person answers → clone learns
- **Teaching Mode**: The person proactively teaches the clone
- **Review Mode**: The clone acts as the person, the person grades accuracy

### API Routes
- `POST /api/chat` — Conversation with the clone
- `POST /api/grow` — Growth session (requires `mode` field)
- `GET /api/identity` — Load full identity profile
- `PUT /api/identity` — Update a section (`section`, `content`, `action`)

## Tech Stack
- Next.js 15 (App Router, Turbopack)
- TypeScript (strict)
- Claude API (Opus 4.6, adaptive thinking)
- Tailwind CSS v4
- Server-side only API keys and identity data

## Key Design Decisions
1. Identity files are Markdown on the server filesystem — simple, private, versionable
2. System prompt is rebuilt from identity files on every request — always current
3. Growth sessions use `<identity_update>` XML tags for structured learning
4. Claude is instructed to NEVER break character in conversation mode
5. Adaptive thinking enabled — the clone thinks harder on complex questions

## Running Locally
```bash
cd mirror
cp .env.example .env  # Add your ANTHROPIC_API_KEY
npm install
npm run dev
```

## Identity Files
Located in `mirror/identity/`. These are the clone's brain:
- `personality.md` — Communication style, tone, humor, social patterns
- `knowledge.md` — What they know, expertise, interests
- `beliefs.md` — Values, principles, opinions, worldview
- `patterns.md` — Decision-making, work habits, reactions
- `history.md` — Background, experiences, relationships
- `growth-journal.md` — Auto-updated log of what the clone has learned
