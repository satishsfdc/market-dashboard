"use client";

import { useState } from "react";
import { Activity, Lock } from "lucide-react";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo gate — replace with real auth (NextAuth, etc.) before production use.
    if (password.length > 0) {
      onLogin();
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-md bg-[var(--signal)] flex items-center justify-center mb-4">
            <Activity size={24} className="text-[var(--bg-deep)]" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-semibold">Lookout</h1>
          <p className="text-xs text-[var(--text-muted)] font-mono-data tracking-wider mt-1">MARKET INTELLIGENCE</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-panel)] border border-[var(--border-hair)] rounded-lg p-6"
        >
          <label className="block text-xs text-[var(--text-secondary)] mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            defaultValue="demo@lookout.app"
            className="w-full bg-[var(--bg-deep)] border border-[var(--border-hair)] rounded-md px-3 py-2 text-sm mb-4 focus:border-[var(--signal)] transition-colors"
          />

          <label className="block text-xs text-[var(--text-secondary)] mb-1.5" htmlFor="password">
            Password
          </label>
          <div className="relative mb-1">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter any password to continue"
              className="w-full bg-[var(--bg-deep)] border border-[var(--border-hair)] rounded-md pl-9 pr-3 py-2 text-sm focus:border-[var(--signal)] transition-colors"
            />
          </div>
          {error && <p className="text-xs text-[var(--bear)] mb-2">Enter a password to continue.</p>}

          <button
            type="submit"
            className="w-full mt-4 py-2 rounded-md bg-[var(--signal)] text-[var(--bg-deep)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-[11px] text-[var(--text-muted)] mt-4 leading-relaxed">
          Demo authentication — any password works. Connect a real auth provider
          (NextAuth, Clerk, Auth0) before deploying to production.
        </p>
      </div>
    </div>
  );
}
