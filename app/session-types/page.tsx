"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MessageSquare,
  Scale,
  Mic,
  Bot,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Eye,
} from "lucide-react";

export default function SessionTypesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-bold md:text-5xl">
                Designed for focused conversations and clearer decisions
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Decisra offers two session types — each built with a different
                intent.
              </p>
            </div>
            <Button asChild variant="hero" size="lg">
              <Link href="/sessions/new">Start a Session</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 1 — Sessions Overview */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Sessions, by intent
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Not all conversations are the same. Decisra separates discussion
              from decision-making — intentionally.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Normal Sessions */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Normal Sessions
              </h2>
            </div>

            <p className="mt-6 text-lg text-muted-foreground">
              Normal Sessions are open, live audio conversations without
              enforced structure.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">What's included:</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">No required scope</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">No AI limits</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">No constraints</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    No decision framing
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Live audio-only room
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Anyone can join with the link
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Guests and observers allowed
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    No persistence after session ends
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-foreground">Use cases:</h3>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• Team alignment</li>
                <li>• Brainstorming</li>
                <li>• Exploratory discussions</li>
                <li>• Casual decision prep</li>
              </ul>
            </div>

            <p className="mt-8 font-medium text-foreground">
              Normal Sessions are flexible by design.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Verdict Sessions */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-accent/10">
                <Scale className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  Verdict Sessions
                </h2>
                <p className="text-sm text-accent">
                  Built for moments when a decision matters.
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-8">
              <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    1
                  </span>
                  <h3 className="font-display text-lg font-semibold">
                    Mandatory Scope
                  </h3>
                </div>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>• Clearly defined decision</li>
                  <li>• Visible throughout the session</li>
                  <li>• Anchors the conversation</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                    2
                  </span>
                  <h3 className="font-display text-lg font-semibold">
                    Optional Context
                  </h3>
                </div>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>• Background information</li>
                  <li>• Constraints</li>
                  <li>• Notes relevant to the decision</li>
                  <li>• Always accessible</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                    3
                  </span>
                  <h3 className="font-display text-lg font-semibold">
                    Scoped AI Assistance
                  </h3>
                </div>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>• Available during the session</li>
                  <li>• Bound strictly to scope</li>
                  <li>• Limited usage per participant</li>
                </ul>
              </div>
            </div>

            <p className="mt-8 text-lg font-medium text-foreground">
              Verdict Sessions reduce drift without forcing outcomes.
            </p>

            <div className="mt-10 rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">
                What Verdict Sessions prevent:
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <span className="text-muted-foreground">Scope creep</span>
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <span className="text-muted-foreground">
                    Repeating background
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <span className="text-muted-foreground">
                    Dominant voices steering off-topic
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <span className="text-muted-foreground">
                    AI going beyond context
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Scoped AI */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Scoped AI, by design
              </h2>
            </div>

            <p className="mt-6 text-lg text-muted-foreground">
              In Verdict Sessions, AI assistance exists to support thinking —
              not replace it.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">AI behavior:</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    Only answers within scope
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    Refuses out-of-scope prompts
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    No memory beyond the session
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-muted-foreground">
                    No decision-making authority
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm font-medium text-foreground">
                If a question goes beyond the scope, the AI will say so.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Participation Model */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Participation, without friction
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <XCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No accounts</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <XCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No roles to configure
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Anyone with a link can join
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card/50 p-6">
              <h3 className="font-semibold text-foreground">
                Available roles:
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="font-medium">Hosts</p>
                  <p className="text-sm text-muted-foreground">
                    Control state and outcomes
                  </p>
                </div>
                <div>
                  <p className="font-medium">Participants</p>
                  <p className="text-sm text-muted-foreground">
                    Active speakers
                  </p>
                </div>
                <div>
                  <p className="font-medium">Observers</p>
                  <p className="text-sm text-muted-foreground">
                    Listen-only with limited interaction
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm italic text-muted-foreground">
                Roles exist for clarity, not control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — What Happens When a Session Ends */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              When the session ends
            </h2>

            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Audio ends</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">AI context ends</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Nothing is stored</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">No summaries saved</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    No decisions logged
                  </span>
                </li>
              </ul>
            </div>

            <p className="mt-6 text-lg font-medium text-foreground">
              Decisra is built for the moment — not the archive.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Session history and artifacts are planned features for future
              phases.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7 — Why This Product Design Is Intentional */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Designed to stay lightweight
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Less overhead",
                "Faster entry",
                "Lower cognitive load",
                "More honest usage",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-lg text-muted-foreground">
              Complexity can be added later.{" "}
              <span className="font-medium text-foreground">
                Clarity cannot.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t border-border bg-accent/5 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Start a session when the decision matters.
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link href="/sessions/new">Start a Session</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View Pricing (Early Access)</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
