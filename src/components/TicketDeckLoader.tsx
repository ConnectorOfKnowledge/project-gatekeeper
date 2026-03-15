"use client";

import dynamic from "next/dynamic";

const TicketDeckWidget = dynamic(
  () =>
    import("ticketdeck").then((mod) => mod.TicketDeckWidget).catch(() => () => null),
  { ssr: false }
);

export default function TicketDeckLoader() {
  return (
    <TicketDeckWidget
      project="ProjectGatekeeper"
      position="bottom-right"
      accentColor="#8b5cf6"
      user="Lonnie Barkby"
      darkMode="auto"
    />
  );
}
