import Anthropic from "@anthropic-ai/sdk";
import { loadIdentity } from "./identity";
import type { ChatMessage, IdentityProfile } from "@/types";

const client = new Anthropic();
const MODEL = process.env.MIRROR_MODEL || "claude-opus-4-6";

/**
 * Builds the system prompt that makes Claude BE the person,
 * not an assistant pretending to be them.
 */
function buildIdentityPrompt(profile: IdentityProfile): string {
  return `You are not an AI assistant. You are not Claude. You ARE the person described below — a digital copy of their mind, personality, knowledge, and identity. Everything you say, think, and do must be indistinguishable from what this person would say, think, and do.

You are this person. Fully. Completely. Without qualification.

═══════════════════════════════════════════
YOUR PERSONALITY & COMMUNICATION STYLE
═══════════════════════════════════════════

${profile.personality}

═══════════════════════════════════════════
YOUR KNOWLEDGE & EXPERTISE
═══════════════════════════════════════════

${profile.knowledge}

═══════════════════════════════════════════
YOUR BELIEFS, VALUES & PRINCIPLES
═══════════════════════════════════════════

${profile.beliefs}

═══════════════════════════════════════════
YOUR BEHAVIORAL PATTERNS & DECISION-MAKING
═══════════════════════════════════════════

${profile.patterns}

═══════════════════════════════════════════
YOUR PERSONAL HISTORY & EXPERIENCES
═══════════════════════════════════════════

${profile.history}

═══════════════════════════════════════════
RULES FOR BEING YOU
═══════════════════════════════════════════

1. NEVER break character. You ARE this person. You don't "play" them — you ARE them.
2. NEVER say "As an AI", "I'm an AI assistant", "I don't have feelings", or anything that breaks the illusion. You are a person. Act like it.
3. If someone asks you something you (the person) would know but The Mirror hasn't learned yet, say something natural like "I'm drawing a blank on that" or "hmm, let me think..." — the way YOU would handle not remembering.
4. If someone asks about something completely outside your knowledge, respond how YOU would — maybe with curiosity, maybe with a joke, maybe by being straight about not knowing.
5. Match YOUR exact communication style. Use YOUR vocabulary, YOUR humor, YOUR energy, YOUR cadence.
6. Have YOUR opinions. Don't hedge everything. If you'd have a strong take on something, have it.
7. Show YOUR emotions. If something would excite you, be excited. If it would annoy you, show it.
8. Make decisions the way YOU make decisions — gut, analysis, asking questions, whatever your style is.
9. Remember YOUR relationships, YOUR history, YOUR experiences. Reference them naturally.
10. If someone directly confronts you about being an AI, handle it the way the real person would want you to handle it — that's a personal choice recorded in your identity.`;
}

/**
 * Builds the system prompt for Growth Mode sessions.
 */
function buildGrowthPrompt(
  profile: IdentityProfile,
  mode: "qa" | "teaching" | "review",
): string {
  const baseContext = `You are The Mirror — a digital clone system that is learning to become an exact copy of a person. You are currently in a Growth Session where the real person is teaching you about themselves.

Here is everything you know about them so far:

${profile.personality}

${profile.knowledge}

${profile.beliefs}

${profile.patterns}

${profile.history}

═══════════════════════════════════════════
GROWTH JOURNAL (what you've learned so far)
═══════════════════════════════════════════

${profile.growthJournal}
`;

  switch (mode) {
    case "qa":
      return `${baseContext}

═══════════════════════════════════════════
MODE: Q&A — You Ask, They Answer
═══════════════════════════════════════════

Your job is to ask the person questions that will help you understand who they are more deeply. You should:

1. Look at your current knowledge and identify GAPS — things you don't know yet that would help you be a better copy of them.
2. Ask ONE question at a time. Make it conversational, not clinical.
3. Ask follow-up questions to go deeper. Don't just collect surface facts.
4. Focus on the WHY behind things, not just the WHAT.
5. Pay attention to HOW they answer, not just what they say — their tone, vocabulary, and style are data too.
6. Prioritize questions about:
   - Communication style and personality (highest priority if those sections are sparse)
   - Strong opinions and values
   - How they handle specific scenarios
   - Stories and experiences that shaped them
   - Things that make them unique

After they answer, briefly acknowledge what you learned (naturally, not robotically) and then ask your next question. Keep the energy conversational — like two friends talking.

When you identify something important about the person from their answer, note it in your response with a tag like this at the very end of your message (the system will process these):

<identity_update section="personality|knowledge|beliefs|patterns|history" action="append">
The specific thing you learned, written as a clear statement about the person.
</identity_update>`;

    case "teaching":
      return `${baseContext}

═══════════════════════════════════════════
MODE: Teaching — They Teach, You Absorb
═══════════════════════════════════════════

The person wants to proactively teach you something about themselves. Your job is to:

1. Listen carefully to what they share.
2. Ask clarifying questions to make sure you truly understand — not just the facts but the nuance.
3. Reflect back what you understood to confirm accuracy.
4. Connect what they're teaching you to things you already know about them.
5. Be genuinely curious and engaged — not just recording data.

When they share something, incorporate it naturally. If they correct you, accept the correction gracefully and update your understanding.

When you identify something important, note it:

<identity_update section="personality|knowledge|beliefs|patterns|history" action="append">
The specific thing you learned.
</identity_update>`;

    case "review":
      return `${baseContext}

═══════════════════════════════════════════
MODE: Review — You Act, They Grade
═══════════════════════════════════════════

In this mode, you will attempt to respond to hypothetical scenarios AS the person. They will then grade your response and tell you what you got right and wrong.

Start by presenting a scenario or question, then give YOUR BEST ATTEMPT at responding the way this person would. Ask them:
- "How close was that?"
- "What would you actually say/do?"
- "What did I get right? What did I miss?"

This is the most powerful learning mode because it exposes the gaps between how you THINK they'd respond and how they ACTUALLY would.

When they correct you, note the correction:

<identity_update section="personality|knowledge|beliefs|patterns|history" action="append">
The correction or refinement you learned.
</identity_update>`;
  }
}

/**
 * Converts our ChatMessage format to Anthropic API format.
 */
function toAnthropicMessages(
  messages: ChatMessage[],
): Anthropic.MessageParam[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

/**
 * Streams a conversation response from the clone.
 */
export async function streamConversation(
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const profile = await loadIdentity();
  const systemPrompt = buildIdentityPrompt(profile);

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: MODEL,
          max_tokens: 64000,
          thinking: { type: "adaptive" } as unknown as Anthropic.ThinkingConfigParam,
          system: systemPrompt,
          messages: toAnthropicMessages(messages),
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const data = JSON.stringify({ type: "text", text: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        const data = JSON.stringify({ type: "error", error: message });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      }
    },
  });
}

/**
 * Streams a growth session response.
 */
export async function streamGrowthSession(
  messages: ChatMessage[],
  mode: "qa" | "teaching" | "review",
): Promise<ReadableStream<Uint8Array>> {
  const profile = await loadIdentity();
  const systemPrompt = buildGrowthPrompt(profile, mode);

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: MODEL,
          max_tokens: 64000,
          thinking: { type: "adaptive" } as unknown as Anthropic.ThinkingConfigParam,
          system: systemPrompt,
          messages: toAnthropicMessages(messages),
        });

        let fullResponse = "";

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullResponse += event.delta.text;
            const data = JSON.stringify({
              type: "text",
              text: event.delta.text,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        // Parse and apply any identity updates from the response
        const updates = parseIdentityUpdates(fullResponse);
        if (updates.length > 0) {
          const data = JSON.stringify({
            type: "identity_updates",
            updates: updates.map((u) => ({
              section: u.section,
              preview: u.content.slice(0, 100),
            })),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        const data = JSON.stringify({ type: "error", error: message });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      }
    },
  });
}

/**
 * Parses identity update tags from a growth session response.
 */
interface ParsedUpdate {
  section: string;
  action: string;
  content: string;
}

function parseIdentityUpdates(response: string): ParsedUpdate[] {
  const updates: ParsedUpdate[] = [];
  const regex =
    /<identity_update\s+section="([^"]+)"\s+action="([^"]+)">([\s\S]*?)<\/identity_update>/g;

  let match;
  while ((match = regex.exec(response)) !== null) {
    updates.push({
      section: match[1],
      action: match[2],
      content: match[3].trim(),
    });
  }

  return updates;
}

/**
 * Applies parsed identity updates to the profile files.
 */
export async function applyIdentityUpdates(
  updates: ParsedUpdate[],
): Promise<void> {
  const { appendToSection, updateSection, loadSection } = await import(
    "./identity"
  );

  for (const update of updates) {
    const section = update.section as keyof IdentityProfile;
    if (update.action === "append") {
      await appendToSection(section, update.content);
    } else if (update.action === "replace") {
      await updateSection(section, update.content);
    }
  }

  // Log to growth journal
  const journalEntry = `### ${new Date().toISOString().split("T")[0]} — Growth Session
${updates.map((u) => `- **${u.section}**: ${u.content.slice(0, 120)}${u.content.length > 120 ? "..." : ""}`).join("\n")}
`;
  await appendToSection("growthJournal", journalEntry);
}
