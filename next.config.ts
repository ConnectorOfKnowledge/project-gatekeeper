import type { NextConfig } from "next";

const hasTicketDeck = (() => {
  try { require.resolve("ticketdeck"); return true; } catch { return false; }
})();

const nextConfig: NextConfig = {
  transpilePackages: hasTicketDeck ? ["ticketdeck"] : [],
};

export default nextConfig;
