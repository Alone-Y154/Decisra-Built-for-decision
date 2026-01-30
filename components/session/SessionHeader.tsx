import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Session } from "@/lib/types/session";

interface SessionHeaderProps {
  session: Session;
  expiresAt?: number | null;
}

const formatTimeLeft = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
};

export function SessionHeader({ session, expiresAt }: SessionHeaderProps) {
  const [contextExpanded, setContextExpanded] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    if (typeof window === "undefined") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  const timeLeftMs = useMemo(() => {
    if (!expiresAt) return null;
    return expiresAt - now;
  }, [expiresAt, now]);

  const timeLeftLabel = useMemo(() => {
    if (timeLeftMs === null) return null;
    if (timeLeftMs <= 0) return "00:00";
    return formatTimeLeft(timeLeftMs);
  }, [timeLeftMs]);

  const isExpiringSoon = typeof timeLeftMs === "number" && timeLeftMs > 0 && timeLeftMs <= 5 * 60 * 1000;

  return (
    <header className="border-b border-border bg-card">
      <div className="container max-w-6xl mx-auto px-4 py-4">
        {/* Session Type Indicator */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">
              {session.type === "verdict" ? "Verdict Session" : "Normal Session"}
            </span>
          </div>

          {timeLeftLabel && (
            <div className="text-xs text-muted-foreground">
              Time left{" "}
              <span
                className={
                  isExpiringSoon
                    ? "font-mono font-semibold text-foreground"
                    : "font-mono text-foreground"
                }
              >
                {timeLeftLabel}
              </span>
            </div>
          )}
        </div>

        {/* Scope Panel - Verdict Only */}
        {session.type === "verdict" && session.scope && (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Decision Scope
              </h2>
              <p className="text-foreground font-medium">{session.scope}</p>
              <p className="text-xs text-muted-foreground mt-2">
                This session is anchored to this decision.
              </p>
            </div>

            {/* Context Panel - Optional */}
            {session.context && (
              <div>
                <button
                  onClick={() => setContextExpanded(!contextExpanded)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  type="button"
                >
                  {contextExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Context
                </button>

                {contextExpanded && (
                  <div className="mt-2 bg-muted/30 rounded-lg p-4 border border-border/50">
                    <p className="text-sm text-muted-foreground">
                      {session.context}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
