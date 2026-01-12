"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Target,
  Users,
  Mic,
  Link as LinkIcon,
  Clock,
  Sparkles,
} from "lucide-react";

type SessionType = "normal" | "verdict" | null;

export default function NewSessionPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<SessionType>(null);
  const [scope, setScope] = useState("");
  const [context, setContext] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const canStartVerdict =
    selectedType === "verdict" && scope.trim() && acknowledged;

  const handleStartNormal = () => {
    const sessionId = `n${Date.now().toString(36)}`;
    router.push(`/sessions/${sessionId}?host=true`);
  };

  const handleStartVerdict = () => {
    if (!canStartVerdict) return;
    const sessionId = `v${Date.now().toString(36)}`;
    const params = new URLSearchParams({
      host: "true",
      scope,
      ...(context && { context }),
    });
    router.push(`/sessions/${sessionId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              Start a session
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose how you want this conversation to work.
            </p>
          </div>
        </div>
      </section>

      {/* Session Type Selection */}
      <section className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Normal Session Card */}
              <div
                onClick={() => setSelectedType("normal")}
                className={`cursor-pointer rounded-2xl border p-8 transition-all duration-300 ${
                  selectedType === "normal"
                    ? "border-accent/50 bg-accent/5 shadow-lg"
                    : "border-border bg-card/50 hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">
                    Normal Session
                  </h2>
                </div>

                <p className="mt-4 text-muted-foreground">
                  Open, live audio conversation without enforced structure.
                </p>

                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    No required scope
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    No AI limits
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    Free-flow discussion
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    Guests and observers allowed
                  </li>
                </ul>

                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Use when:</span>{" "}
                    You want to talk, explore, or align — without making a
                    decision yet.
                  </p>
                </div>

                {selectedType === "normal" && (
                  <Button
                    className="mt-6 w-full"
                    variant="hero"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartNormal();
                    }}
                  >
                    Start Normal Session
                  </Button>
                )}
              </div>

              {/* Verdict Session Card */}
              <div
                onClick={() => setSelectedType("verdict")}
                className={`relative cursor-pointer rounded-2xl border p-8 transition-all duration-300 ${
                  selectedType === "verdict"
                    ? "border-accent/50 bg-gradient-to-b from-accent/10 to-background shadow-lg"
                    : "border-border bg-card/50 hover:border-border/80"
                }`}
              >
                <div className="absolute right-4 top-4 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
                  Decision-focused
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">
                    Verdict Session
                  </h2>
                </div>

                <p className="mt-4 text-muted-foreground">
                  A structured session designed to support a specific decision.
                </p>

                <ul className="mt-6 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Mandatory decision scope
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Optional context
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Scoped AI assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Designed to reduce drift
                  </li>
                </ul>

                <div className="mt-6 rounded-lg bg-accent/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Use when:</span>{" "}
                    A decision needs clarity.
                  </p>
                </div>

                {selectedType !== "verdict" && (
                  <p className="mt-6 text-center text-xs text-muted-foreground">
                    Requires defining a clear scope before starting.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verdict Session Setup (Conditional) */}
      {selectedType === "verdict" && (
        <section className="border-t border-border bg-muted/30 py-12">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-2xl">
              <h3 className="font-display text-xl font-semibold">
                Configure your Verdict Session
              </h3>

              {/* Step 1: Scope */}
              <div className="mt-8">
                <Label
                  htmlFor="scope"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <Target className="h-4 w-4 text-accent" />
                  What decision is being discussed?
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Example: Should we launch feature X this quarter?"
                  className="mt-3 min-h-[100px] resize-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  This scope will be visible to everyone throughout the session.
                  Keep it specific — one decision per session.
                </p>
              </div>

              {/* Step 2: Context */}
              <div className="mt-8">
                <Label
                  htmlFor="context"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  Context
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Background, constraints, or relevant information."
                  className="mt-3 min-h-[100px] resize-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Context helps participants and AI stay aligned.
                </p>
              </div>

              {/* Step 3: Acknowledgment */}
              <div className="mt-8 rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acknowledge"
                    checked={acknowledged}
                    onCheckedChange={(checked) =>
                      setAcknowledged(checked === true)
                    }
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="acknowledge"
                    className="cursor-pointer text-sm leading-relaxed"
                  >
                    I understand this session is structured around the scope
                    defined above.
                  </Label>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Button
                  className="w-full"
                  variant="hero"
                  size="lg"
                  disabled={!canStartVerdict}
                  onClick={handleStartVerdict}
                >
                  Start Verdict Session
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  This will create a live audio room.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What Happens Next */}
      <section className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <h3 className="font-display text-lg font-semibold">
              What happens after you start?
            </h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <Mic className="h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm">A live audio room is created</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <LinkIcon className="h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm">You'll receive a shareable session link</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <Users className="h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm">Anyone with the link can join</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <Clock className="h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm">Nothing is saved after the session ends</span>
              </div>
            </div>

            <p className="mt-6 text-center text-muted-foreground">
              No setup. No account. No friction.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="border-t border-border py-8">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs text-muted-foreground/60">
            Decisra sessions are live and ephemeral. Planned features like
            session history and summaries are part of future phases.
          </p>
        </div>
      </section>
    </div>
  );
}
