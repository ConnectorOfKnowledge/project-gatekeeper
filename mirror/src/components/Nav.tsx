"use client";

type View = "chat" | "grow" | "identity";

interface NavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const tabs: { id: View; label: string; description: string }[] = [
  { id: "chat", label: "Talk", description: "Conversation mode" },
  { id: "grow", label: "Grow", description: "Teach the clone" },
  { id: "identity", label: "Identity", description: "Edit profile" },
];

export default function Nav({ currentView, onViewChange }: NavProps) {
  return (
    <header className="border-b border-mirror-border bg-mirror-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-mirror-accent to-mirror-clone" />
          <h1 className="text-lg font-semibold tracking-tight">The Mirror</h1>
        </div>
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              title={tab.description}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                currentView === tab.id
                  ? "bg-mirror-accent text-white"
                  : "text-mirror-text-dim hover:bg-mirror-surface-hover hover:text-mirror-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
