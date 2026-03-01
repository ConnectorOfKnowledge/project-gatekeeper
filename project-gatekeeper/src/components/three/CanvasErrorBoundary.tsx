'use client';

// ============================================================
// CanvasErrorBoundary — Catches WebGL / R3F initialization errors
// Shows a graceful fallback instead of crashing the page.
// ============================================================

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class CanvasErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[WebGL Error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-0 bg-black flex items-center justify-center">
          {/* Subtle fallback — dark void with a faint breathing dot */}
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: 'rgba(79, 195, 247, 0.3)',
              boxShadow: '0 0 20px rgba(79, 195, 247, 0.15), 0 0 60px rgba(79, 195, 247, 0.05)',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          />
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.5); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
