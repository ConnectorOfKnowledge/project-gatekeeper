"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import type { GrowthMode } from "@/types";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

const GROWTH_MODES: { id: GrowthMode; label: string; description: string; icon: string }[] = [
  {
    id: "qa",
    label: "Q&A",
    description: "The Mirror asks you questions to learn about you",
    icon: "?",
  },
  {
    id: "teaching",
    label: "Teach",
    description: "You proactively teach The Mirror about yourself",
    icon: "+",
  },
  {
    id: "review",
    label: "Review",
    description: "The Mirror acts as you and you grade its accuracy",
    icon: "~",
  },
];

const STARTER_MESSAGES: Record<GrowthMode, string> = {
  qa: "I'm ready for a Q&A session. Start asking me questions about myself so you can learn who I am.",
  teaching: "I want to teach you something about myself.",
  review: "Let's do a review session. Present a scenario and respond as if you were me, then I'll tell you how close you got.",
};

export default function GrowthPanel() {
  const [mode, setMode] = useState<GrowthMode | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    stopStreaming,
  } = useChat({
    endpoint: "/api/grow",
    growthMode: mode || undefined,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startSession = (selectedMode: GrowthMode) => {
    clearMessages();
    setMode(selectedMode);
    setHasStarted(true);
    // Send the starter message to kick off the session
    setTimeout(() => sendMessage(STARTER_MESSAGES[selectedMode]), 100);
  };

  const endSession = () => {
    clearMessages();
    setMode(null);
    setHasStarted(false);
  };

  // Mode selection screen
  if (!mode || !hasStarted) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-semibold">Growth Sessions</h2>
            <p className="text-mirror-text-dim">
              This is where you teach The Mirror to become you. Choose how you
              want to train it.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {GROWTH_MODES.map((gm) => (
              <button
                key={gm.id}
                onClick={() => startSession(gm.id)}
                className="group rounded-xl border border-mirror-border bg-mirror-surface p-6 text-left transition-all hover:border-mirror-accent hover:shadow-lg hover:shadow-mirror-accent/10"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-mirror-accent/20 text-lg font-bold text-mirror-accent transition-colors group-hover:bg-mirror-accent group-hover:text-white">
                  {gm.icon}
                </div>
                <h3 className="mb-1 font-semibold">{gm.label}</h3>
                <p className="text-sm text-mirror-text-dim">
                  {gm.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active session
  const currentMode = GROWTH_MODES.find((gm) => gm.id === mode);

  return (
    <div className="flex h-full flex-col">
      {/* Session header */}
      <div className="flex items-center justify-between border-b border-mirror-border bg-mirror-surface/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-mirror-accent/20 text-xs font-bold text-mirror-accent">
            {currentMode?.icon}
          </div>
          <span className="text-sm font-medium">
            {currentMode?.label} Session
          </span>
          <span className="text-xs text-mirror-text-dim">
            {currentMode?.description}
          </span>
        </div>
        <button
          onClick={endSession}
          className="rounded-lg px-3 py-1 text-sm text-mirror-text-dim transition-colors hover:bg-mirror-surface-hover hover:text-mirror-text"
        >
          End Session
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message, i) => (
            <MessageBubble
              key={`${message.timestamp}-${i}`}
              message={message}
              isStreaming={
                isStreaming &&
                i === messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>

      <ChatInput
        onSend={sendMessage}
        isStreaming={isStreaming}
        onStop={stopStreaming}
        placeholder={
          mode === "qa"
            ? "Answer The Mirror's questions..."
            : mode === "teaching"
              ? "Teach The Mirror something about you..."
              : "Grade The Mirror's performance..."
        }
      />
    </div>
  );
}
