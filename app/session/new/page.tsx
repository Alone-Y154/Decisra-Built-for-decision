"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiFetchJson } from "@/lib/api";
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

type CreateSessionSuccess = {
  sessionId: string;
  expiresAt: number;
  hostToken: string;
};

type CreateSessionFailure = { error: string };

export default function NewSessionPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<SessionType>(null);
  const [scope, setScope] = useState("");
  const [context, setContext] = useState("");
  const [goalTitle, setGoalTitle] = useState<string>("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type VerdictGoalPreset = {
    title: string;
    scope: string;
    context: string;
  };

  const VERDICT_GOALS: VerdictGoalPreset[] = useMemo(
    () => [
      {
        title: "Budget allocation & resource mapping",
        scope: "Regarding the budget allocation and resource mapping",
        context: "Need at least $1,000 to maintain infrastructure. Allocate budget across infra, tooling, and marketing while keeping runway safe.",
      },
      {
        title: "Go/No-go for a tight deadline",
        scope: "Should we commit to a 2-week delivery deadline?",
        context: "A partner wants delivery in 2 weeks. Team is stretched. Decide go/no-go, scope cuts, and a contingency plan.",
      },
      {
        title: "Hiring priority (one role)",
        scope: "Which single hire should we make this quarter?",
        context: "We can hire 1 person: senior engineer vs growth marketer vs customer success. Optimize for the highest impact in 90 days.",
      },
      {
        title: "Pricing tiers redesign",
        scope: "How should we restructure pricing tiers to be clearer and convert better?",
        context: "Current pricing is confusing. Create 3 tiers with clear limits, value metrics, and upgrade path without hurting retention.",
      },
      {
        title: "Roadmap prioritization (6 weeks)",
        scope: "What should we prioritize on the roadmap for the next 6 weeks?",
        context: "We have 6 feature requests and limited capacity (2 dev-weeks per sprint). Consider impact, dependencies, and risks.",
      },
      {
        title: "Feature launch strategy",
        scope: "How should we launch a new feature safely?",
        context: "We want a rollout plan that minimizes support load, mitigates risk, and has clear messaging (beta, staged rollout, GA criteria).",
      },
      {
        title: "Customer escalation plan",
        scope: "How should we respond to a customer escalation about downtime?",
        context: "A key customer is unhappy. Decide remediation steps, timeline, compensation options, and prevention plan.",
      },
      {
        title: "Stakeholder alignment",
        scope: "How do we resolve conflicting stakeholder viewpoints and make a decision?",
        context: "Multiple stakeholders disagree. Summarize viewpoints, clarify assumptions, and propose a decision path and owner.",
      },
      {
        title: "Marketing channel selection",
        scope: "Which marketing channels should we test first?",
        context: "$2,000 test budget. Options: Google ads, LinkedIn, content, partnerships. Define a 2-week experiment plan and success metrics.",
      },
      {
        title: "Support process improvement",
        scope: "How can we reduce support response times without hiring?",
        context: "Support is slow. Propose triage workflow, automation, and metrics to improve time-to-first-response.",
      },
      {
        title: "Technical debt prioritization",
        scope: "What technical debt should we tackle first?",
        context: "Reliability issues and slower dev velocity. We can spend ~20% of sprint capacity. Prioritize by risk and customer impact.",
      },
      {
        title: "Vendor/tool selection",
        scope: "Which vendor/tool should we choose and why?",
        context: "Compare options by cost, setup time, data ownership, reliability, and team fit. Produce a weighted decision.",
      },
      {
        title: "Infra cost reduction",
        scope: "How do we reduce infrastructure costs safely?",
        context: "Infra spend is up 40% in 2 months. Identify quick wins (right-sizing, caching, reserved instances) and a safe rollout plan.",
      },
      {
        title: "Onboarding improvement experiments",
        scope: "How can we improve user onboarding and activation?",
        context: "Activation rate is low. Propose 3 experiments, required changes, and how to measure success.",
      },
      {
        title: "Reliability commitment / SLA",
        scope: "Should we offer a 99.9% SLA for a paid tier?",
        context: "Evaluate feasibility, required engineering work, monitoring, incident response, and cost impact.",
      },
      {
        title: "Security priority decision",
        scope: "What security improvements should we prioritize first?",
        context: "Options: SSO, audit logs, pentest, secrets rotation. Limited time. Prioritize by risk reduction and customer needs.",
      },
      {
        title: "Partnership evaluation",
        scope: "Should we pursue this partnership opportunity?",
        context: "Partner offers distribution but wants exclusivity. Evaluate upside, risks, and negotiation points.",
      },
      {
        title: "Feature request triage",
        scope: "Which 3 feature requests should we build next?",
        context: "We have 10 customer requests. Choose top 3 based on impact, effort, strategic fit, and revenue potential.",
      },
      {
        title: "Retention strategy",
        scope: "How should we reduce churn over the next 30 days?",
        context: "Churn increased last month. Identify likely causes, propose investigation steps, and list experiments to improve retention.",
      },
      {
        title: "Decision summary + recommendation",
        scope: "Summarize options and recommend a path forward",
        context: "We have multiple viewpoints and constraints. Produce a clear recommendation, trade-offs, and next steps.",
      },
    ],
    []
  );

  const goalBagRef = useRef<number[]>([]);

  const pickRandomGoal = () => {
    if (VERDICT_GOALS.length === 0) return;

    if (goalBagRef.current.length === 0) {
      goalBagRef.current = Array.from({ length: VERDICT_GOALS.length }, (_, i) => i);
      for (let i = goalBagRef.current.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = goalBagRef.current[i];
        goalBagRef.current[i] = goalBagRef.current[j];
        goalBagRef.current[j] = tmp;
      }
    }

    const idx = goalBagRef.current.pop();
    if (typeof idx !== "number") return;
    const preset = VERDICT_GOALS[idx];
    setGoalTitle(preset.title);
    setScope(preset.scope);
    setContext(preset.context);
  };

  const canStartVerdict =
    selectedType === "verdict" && scope.trim() && acknowledged;

  const createSession = async (payload: {
    type: "normal" | "verdict";
    scope?: string;
    context?: string;
  }) => {
    setIsCreating(true);
    setError(null);
    try {
      const { data } = await apiFetchJson<CreateSessionSuccess>("/api/session", {
        method: "POST",
        body: payload,
      });

      if (!data?.sessionId || !data?.hostToken) throw new Error("Failed to create session");

      // Keep hostToken for future authenticated host actions.
      sessionStorage.setItem(`decisra:hostToken:${data.sessionId}`, data.hostToken);
      // Used for client-side expiry UX (backend should still enforce expiry).
      if (typeof data.expiresAt === "number") {
        sessionStorage.setItem(
          `decisra:expiresAt:${data.sessionId}`,
          String(data.expiresAt)
        );
      }

      router.push(`/session/${data.sessionId}`);
    } catch (err) {
      if (err && typeof err === "object" && "error" in err) {
        const payload = err as CreateSessionFailure;
        if (typeof payload.error === "string") {
          setError(payload.error);
        }
      }
      const message = err instanceof Error ? err.message : "Failed to create session";
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartNormal = () => {
    createSession({ type: "normal" });
  };

  const handleStartVerdict = () => {
    if (!canStartVerdict) return;
    createSession({
      type: "verdict",
      scope,
      ...(context.trim() ? { context } : null),
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-1/2 h-75 w-75 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
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
            {error && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
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
                    disabled={isCreating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartNormal();
                    }}
                  >
                    {isCreating ? "Creating..." : "Start Normal Session"}
                  </Button>
                )}
              </div>

              {/* Verdict Session Card */}
              <div
                onClick={() => setSelectedType("verdict")}
                className={`relative cursor-pointer rounded-2xl border p-8 transition-all duration-300 ${
                  selectedType === "verdict"
                    ? "border-accent/50 bg-linear-to-b from-accent/10 to-background shadow-lg"
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl font-semibold">
                  Configure your Verdict Session
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={pickRandomGoal}
                >
                  Random goal
                </Button>
              </div>

              {goalTitle ? (
                <div className="mt-3 rounded-lg border border-border bg-card p-4">
                  <div className="text-sm font-medium">Goal: {goalTitle}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Scope and context were filled for you. Edit if needed.
                  </div>
                </div>
              ) : null}

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
                  className="mt-3 min-h-25 resize-none"
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
                  className="mt-3 min-h-25 resize-none"
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
                  disabled={!canStartVerdict || isCreating}
                  onClick={handleStartVerdict}
                >
                  {isCreating ? "Creating..." : "Start Verdict Session"}
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
                <span className="text-sm">You&apos;ll receive a shareable session link</span>
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
