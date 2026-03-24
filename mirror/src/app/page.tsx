"use client";

import { useState } from "react";
import Chat from "@/components/Chat";
import Nav from "@/components/Nav";
import GrowthPanel from "@/components/GrowthPanel";
import IdentityEditor from "@/components/IdentityEditor";

type View = "chat" | "grow" | "identity";

export default function Home() {
  const [view, setView] = useState<View>("chat");

  return (
    <div className="flex h-dvh flex-col">
      <Nav currentView={view} onViewChange={setView} />
      <main className="flex-1 overflow-hidden">
        {view === "chat" && <Chat />}
        {view === "grow" && <GrowthPanel />}
        {view === "identity" && <IdentityEditor />}
      </main>
    </div>
  );
}
