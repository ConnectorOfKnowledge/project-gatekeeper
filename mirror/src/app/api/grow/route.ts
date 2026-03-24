import { NextRequest, NextResponse } from "next/server";
import { streamGrowthSession, applyIdentityUpdates } from "@/core/engine";
import type { ChatMessage, GrowthMode } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { messages, mode } = (await request.json()) as {
      messages: ChatMessage[];
      mode: GrowthMode;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 },
      );
    }

    if (!["qa", "teaching", "review"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid growth mode" },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const stream = await streamGrowthSession(messages, mode);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Growth API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
