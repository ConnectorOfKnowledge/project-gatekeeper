import { NextRequest, NextResponse } from "next/server";
import {
  loadIdentity,
  loadSection,
  updateSection,
  appendToSection,
} from "@/core/identity";
import type { IdentitySection, IDENTITY_SECTIONS as Sections } from "@/types";
import { IDENTITY_SECTIONS } from "@/types";

export async function GET() {
  try {
    const profile = await loadIdentity();
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Identity load error:", error);
    return NextResponse.json(
      { error: "Failed to load identity" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { section, content, action } = (await request.json()) as {
      section: IdentitySection;
      content: string;
      action: "replace" | "append";
    };

    if (!IDENTITY_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: "Invalid identity section" },
        { status: 400 },
      );
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    if (action === "append") {
      await appendToSection(section, content);
    } else {
      await updateSection(section, content);
    }

    const updated = await loadSection(section);
    return NextResponse.json({ section, content: updated });
  } catch (error) {
    console.error("Identity update error:", error);
    return NextResponse.json(
      { error: "Failed to update identity" },
      { status: 500 },
    );
  }
}
