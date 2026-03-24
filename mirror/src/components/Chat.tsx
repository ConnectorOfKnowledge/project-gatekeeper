"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function Chat() {
  const { messages, isStreaming, error, sendMessage, clearMessages, stopStreaming } =
    useChat({ endpoint: "/api/chat" });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-24 text-center">
              <div className="mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-mirror-accent to-mirror-clone opacity-60" />
              <h2 className="mb-2 text-xl font-medium text-mirror-text">
                Talk to The Mirror
              </h2>
              <p className="max-w-md text-sm text-mirror-text-dim">
                This is your digital clone. The more you teach it in the Grow
                tab, the more it becomes you. Start a conversation — or go to
                Grow to teach it who you are first.
              </p>
            </div>
          )}

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

      {/* Clear button */}
      {messages.length > 0 && !isStreaming && (
        <div className="flex justify-center pb-2">
          <button
            onClick={clearMessages}
            className="rounded-full px-4 py-1 text-xs text-mirror-text-dim transition-colors hover:bg-mirror-surface-hover hover:text-mirror-text"
          >
            Clear conversation
          </button>
        </div>
      )}

      <ChatInput
        onSend={sendMessage}
        isStreaming={isStreaming}
        onStop={stopStreaming}
        placeholder="Talk to your clone..."
      />
    </div>
  );
}
