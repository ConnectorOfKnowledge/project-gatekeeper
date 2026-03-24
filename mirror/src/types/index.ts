// ============================================================
// THE MIRROR — Core Type Definitions
// ============================================================

// --- Identity Profile ---

export interface IdentityProfile {
  personality: string;
  knowledge: string;
  beliefs: string;
  patterns: string;
  history: string;
  growthJournal: string;
}

export type IdentitySection = keyof IdentityProfile;

export const IDENTITY_SECTIONS: IdentitySection[] = [
  "personality",
  "knowledge",
  "beliefs",
  "patterns",
  "history",
  "growthJournal",
];

export const IDENTITY_FILE_MAP: Record<IdentitySection, string> = {
  personality: "personality.md",
  knowledge: "knowledge.md",
  beliefs: "beliefs.md",
  patterns: "patterns.md",
  history: "history.md",
  growthJournal: "growth-journal.md",
};

export const IDENTITY_LABELS: Record<IdentitySection, string> = {
  personality: "Personality & Communication Style",
  knowledge: "Knowledge & Expertise",
  beliefs: "Beliefs, Values & Principles",
  patterns: "Behavioral Patterns & Decision-Making",
  history: "Personal History & Experiences",
  growthJournal: "Growth Journal",
};

// --- Conversation ---

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  confidence?: number; // 0-1, how confident the clone is this is what Lonnie would say
}

export interface ConversationSession {
  id: string;
  messages: ChatMessage[];
  startedAt: number;
  mode: "conversation" | "growth";
}

// --- Growth Interface ---

export type GrowthMode = "qa" | "teaching" | "review";

export interface GrowthSession {
  id: string;
  mode: GrowthMode;
  messages: ChatMessage[];
  startedAt: number;
  sectionsUpdated: IdentitySection[];
}

export interface GrowthQuestion {
  question: string;
  section: IdentitySection;
  priority: "high" | "medium" | "low";
  reason: string;
}

// --- API ---

export interface ChatRequest {
  messages: ChatMessage[];
  mode: "conversation" | "growth";
  growthMode?: GrowthMode;
}

export interface ChatResponse {
  message: string;
  confidence?: number;
  identityUpdates?: IdentityUpdate[];
}

export interface IdentityUpdate {
  section: IdentitySection;
  action: "append" | "replace";
  content: string;
  reason: string;
}

// --- Confidence ---

export interface ConfidenceAssessment {
  overall: number;
  reasoning: string;
  gaps: string[];
}
