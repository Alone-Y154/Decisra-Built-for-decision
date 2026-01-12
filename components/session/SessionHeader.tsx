import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Session } from "@/app/sessions/[sessionId]/page";

interface SessionHeaderProps {
  session: Session;
}

export function SessionHeader({ session }: SessionHeaderProps) {
  const [contextExpanded, setContextExpanded] = useState(false);

  return (
    <header className="border-b border-border bg-card">
      <div className="container max-w-6xl mx-auto px-4 py-4">
        {/* Session Type Indicator */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-muted-foreground font-medium">
            {session.type === "verdict" ? "Verdict Session" : "Normal Session"}
          </span>
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
