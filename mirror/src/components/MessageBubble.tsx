"use client";

import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function MessageBubble({
  message,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  // Strip identity_update tags from display
  const displayContent = message.content.replace(
    /<identity_update[\s\S]*?<\/identity_update>/g,
    "",
  ).trim();

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-mirror-user text-white"
            : "clone-glow border border-mirror-border bg-mirror-surface text-mirror-text"
        }`}
      >
        {!isUser && (
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-mirror-clone" />
            <span className="text-xs font-medium text-mirror-clone">
              The Mirror
            </span>
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {displayContent}
          {isStreaming && !displayContent && (
            <span className="inline-flex gap-1">
              <span className="typing-dot h-2 w-2 rounded-full bg-mirror-text-dim" />
              <span className="typing-dot h-2 w-2 rounded-full bg-mirror-text-dim" />
              <span className="typing-dot h-2 w-2 rounded-full bg-mirror-text-dim" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
