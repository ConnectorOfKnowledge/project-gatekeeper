"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IDENTITY_SECTIONS,
  IDENTITY_LABELS,
  type IdentityProfile,
  type IdentitySection,
} from "@/types";

export default function IdentityEditor() {
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [activeSection, setActiveSection] = useState<IdentitySection>("personality");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/identity");
      if (res.ok) {
        const data = (await res.json()) as IdentityProfile;
        setProfile(data);
        setEditContent(data[activeSection]);
      }
    } catch {
      // Profile will be created on first load
    } finally {
      setLoading(false);
    }
  }, [activeSection]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile) {
      setEditContent(profile[activeSection]);
    }
  }, [activeSection, profile]);

  const saveSection = async () => {
    setSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/identity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: activeSection,
          content: editContent,
          action: "replace",
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { section: string; content: string };
        setProfile((prev) =>
          prev
            ? { ...prev, [activeSection]: data.content }
            : null,
        );
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-mirror-text-dim">Loading identity...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar - section list */}
      <div className="w-56 shrink-0 border-r border-mirror-border bg-mirror-surface/50 p-3">
        <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-mirror-text-dim">
          Identity Sections
        </h3>
        <nav className="space-y-1">
          {IDENTITY_SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeSection === section
                  ? "bg-mirror-accent/20 text-mirror-accent"
                  : "text-mirror-text-dim hover:bg-mirror-surface-hover hover:text-mirror-text"
              }`}
            >
              {IDENTITY_LABELS[section]}
            </button>
          ))}
        </nav>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {IDENTITY_LABELS[activeSection]}
          </h2>
          <div className="flex items-center gap-3">
            {saveStatus === "saved" && (
              <span className="text-sm text-mirror-success">Saved</span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm text-red-400">Error saving</span>
            )}
            <button
              onClick={saveSection}
              disabled={saving}
              className="rounded-lg bg-mirror-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-mirror-accent-glow disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <p className="mb-4 text-sm text-mirror-text-dim">
          Edit this section directly, or use Growth Sessions to let The Mirror
          learn about you through conversation.
        </p>

        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="flex-1 resize-none rounded-xl border border-mirror-border bg-mirror-bg p-4 font-mono text-sm text-mirror-text placeholder:text-mirror-text-dim focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
