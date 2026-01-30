import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Headphones, ChevronDown, ChevronUp } from "lucide-react";
import type { Session } from "@/lib/types/session";

interface JoinPreviewProps {
  session: Session;
  onJoin: (role: "participant" | "observer", name?: string) => void;
  isHost: boolean;
  isJoining?: boolean;
  notice?: string | null;
  error?: string | null;
}

export function JoinPreview({
  session,
  onJoin,
  isHost,
  isJoining = false,
  notice = null,
  error = null,
}: JoinPreviewProps) {
  const [selectedRole, setSelectedRole] = useState<
    "participant" | "observer" | null
  >(isHost ? "participant" : null);
  const [displayName, setDisplayName] = useState("");
  const [showContext, setShowContext] = useState(false);

  const handleJoin = () => {
    if (!selectedRole) return;
    onJoin(selectedRole, displayName.trim() || undefined);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {notice && (
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-foreground">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {/* Session Type Indicator */}
        <div className="text-sm text-muted-foreground">
          {session.type === "normal" ? "Normal Session" : "Verdict Session"}
        </div>

        {/* Preview Copy */}
        <p className="text-foreground">
          {isHost
            ? "You can enter immediately as the host."
            : "Request access to join this live session."}
        </p>

        {/* Decision Scope (Verdict Only) */}
        {session.type === "verdict" && session.scope && (
          <div className="space-y-3">
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                Decision Scope
              </p>
              <p className="text-foreground">{session.scope}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This session is structured around this decision.
            </p>
          </div>
        )}

        {/* Context (Verdict Only, Optional, Collapsed) */}
        {session.type === "verdict" && session.context && (
          <div>
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              Context (optional)
              {showContext ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {showContext && (
              <div className="mt-2 p-3 bg-muted/20 rounded-lg text-sm text-muted-foreground border border-border/50">
                {session.context}
              </div>
            )}
          </div>
        )}

        {!isHost && (
          <>
            {/* Role Selection Section */}
            <div className="space-y-4">
              <p className="text-foreground">How would you like to join?</p>

              {/* Participate Option */}
              <button
                onClick={() => setSelectedRole("participant")}
                disabled={isJoining}
                className={`w-full hello p-4 rounded-lg border transition-all text-left ${
                  selectedRole === "participant"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
                type="button"
              >
                <div className="flex items-start gap-3">
                  <Mic className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Participate</p>
                    <p className="text-sm text-muted-foreground">
                      Speak and take part in the conversation.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Mic enabled</li>
                      <li>• Can contribute actively</li>
                      {session.type === "verdict" && (
                        <li>• In Verdict sessions, can use scoped AI</li>
                      )}
                    </ul>
                  </div>
                </div>
              </button>

              {/* Observe Option */}
              <button
                onClick={() => setSelectedRole("observer")}
                disabled={isJoining}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  selectedRole === "observer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
                type="button"
              >
                <div className="flex items-start gap-3">
                  <Headphones className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Observe</p>
                    <p className="text-sm text-muted-foreground">
                      Listen without speaking.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Mic disabled</li>
                      <li>• No AI access</li>
                      <li>• You&apos;ll be visible as an observer</li>
                    </ul>
                  </div>
                </div>
              </button>

              {/* Role Lock Note */}
              <p className="text-xs text-muted-foreground">
                You won&apos;t be able to switch roles later.
              </p>
            </div>
          </>
        )}

        {/* Display Name Input */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Display name (optional)
          </label>
          <Input
            placeholder="How others will see you"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-background"
          />
        </div>

        {/* Primary CTA */}
        <Button
          onClick={handleJoin}
          disabled={!selectedRole || isJoining}
          className="w-full"
          size="lg"
          variant="hero"
        >
          {isJoining
            ? isHost
              ? "Entering..."
              : "Requesting..."
            : isHost
              ? "Enter as Host"
              : "Request to Join"}
        </Button>

        {/* Footer Copy */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          This is a live, audio-only session.
          <br />
          Nothing from this session will be saved.
        </p>
      </div>
    </div>
  );
}
