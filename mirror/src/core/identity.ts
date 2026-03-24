import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  IdentityProfile,
  IdentitySection,
  IDENTITY_FILE_MAP,
  IDENTITY_SECTIONS,
} from "@/types";

const IDENTITY_DIR = join(process.cwd(), "identity");

/**
 * Ensures the identity directory exists and has starter files.
 */
async function ensureIdentityDir(): Promise<void> {
  if (!existsSync(IDENTITY_DIR)) {
    await mkdir(IDENTITY_DIR, { recursive: true });
  }

  for (const section of IDENTITY_SECTIONS) {
    const filePath = join(IDENTITY_DIR, IDENTITY_FILE_MAP[section]);
    if (!existsSync(filePath)) {
      await writeFile(filePath, getDefaultContent(section), "utf-8");
    }
  }
}

/**
 * Loads the full identity profile from disk.
 */
export async function loadIdentity(): Promise<IdentityProfile> {
  await ensureIdentityDir();

  const profile: Partial<IdentityProfile> = {};

  for (const section of IDENTITY_SECTIONS) {
    const filePath = join(IDENTITY_DIR, IDENTITY_FILE_MAP[section]);
    profile[section] = await readFile(filePath, "utf-8");
  }

  return profile as IdentityProfile;
}

/**
 * Loads a single identity section.
 */
export async function loadSection(
  section: IdentitySection,
): Promise<string> {
  await ensureIdentityDir();
  const filePath = join(IDENTITY_DIR, IDENTITY_FILE_MAP[section]);
  return readFile(filePath, "utf-8");
}

/**
 * Updates a single identity section.
 */
export async function updateSection(
  section: IdentitySection,
  content: string,
): Promise<void> {
  await ensureIdentityDir();
  const filePath = join(IDENTITY_DIR, IDENTITY_FILE_MAP[section]);
  await writeFile(filePath, content, "utf-8");
}

/**
 * Appends content to an identity section.
 */
export async function appendToSection(
  section: IdentitySection,
  content: string,
): Promise<void> {
  const existing = await loadSection(section);
  const updated = existing.trimEnd() + "\n\n" + content;
  await updateSection(section, updated);
}

/**
 * Default content for each identity section — prompts Lonnie to fill them in.
 */
function getDefaultContent(section: IdentitySection): string {
  switch (section) {
    case "personality":
      return `# Personality & Communication Style

<!-- This is where The Mirror learns HOW you communicate. -->
<!-- Fill this in yourself, or use the Growth Interface to teach it interactively. -->

## Communication Style
- How do you typically talk? Formal? Casual? Somewhere in between?
- What words or phrases do you use often?
- How do you greet people?
- What's your sense of humor like?

## Tone & Energy
- Are you high-energy or laid-back?
- How do you come across in text vs. in person?
- What's your default emotional register?

## Social Style
- How do you handle small talk?
- How do you respond to compliments? Criticism?
- Are you direct or do you ease into things?
`;

    case "knowledge":
      return `# Knowledge & Expertise

<!-- This is where The Mirror learns WHAT you know. -->

## Professional Expertise
- What do you do for work?
- What are you an expert in?
- What tools/technologies/methods do you use daily?

## Casual Knowledge
- What topics can you hold a conversation about?
- What are your hobbies and interests?
- What do you know a lot about that might surprise people?

## Learning Style
- How do you learn new things?
- What are you currently learning about?
`;

    case "beliefs":
      return `# Beliefs, Values & Principles

<!-- This is where The Mirror learns WHY you do what you do. -->

## Core Values
- What matters most to you?
- What principles guide your decisions?
- What hills will you die on?

## Worldview
- How do you see the world?
- What do you believe about people?
- What's your philosophy on work? Life? Success?

## Opinions
- What strong opinions do you hold?
- What topics are you passionate about?
- Where do you stand on things others might disagree about?
`;

    case "patterns":
      return `# Behavioral Patterns & Decision-Making

<!-- This is where The Mirror learns HOW you think and act. -->

## Decision-Making
- How do you make big decisions? Gut feeling? Pros/cons list? Talk it out?
- What's your risk tolerance?
- How quickly do you decide things?

## Work Patterns
- How do you approach a new project?
- What's your workflow like?
- How do you handle deadlines and pressure?

## Reactions
- What excites you?
- What frustrates you?
- How do you handle conflict?
- What's your default response when something goes wrong?

## Habits
- What routines do you follow?
- What are your productivity patterns?
`;

    case "history":
      return `# Personal History & Experiences

<!-- This is where The Mirror learns WHERE you've been and what shaped you. -->

## Background
- Where are you from?
- What's your educational background?
- What career path have you taken?

## Defining Experiences
- What experiences shaped who you are?
- What are you most proud of?
- What lessons did you learn the hard way?

## Relationships
- Who are the important people in your life?
- How do you describe yourself to new people?
`;

    case "growthJournal":
      return `# Growth Journal

<!-- This file is automatically updated as The Mirror learns about you. -->
<!-- Each entry records what was learned, when, and how. -->

## Log

*No entries yet. Start a Growth Session to teach The Mirror about yourself.*
`;
  }
}
