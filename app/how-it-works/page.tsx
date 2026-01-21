"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Play,
  LayoutList,
  Target,
  Mic,
  Bot,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Scale,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-bold md:text-5xl">
                How Decisra Works
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                A simple flow designed to keep conversations focused and
                decisions clear.
              </p>
            </div>
            <Button asChild variant="hero" size="lg">
              <Link href="/session/new">Start a Session</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 1 — The Core Idea */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Built around decisions, not meetings.
            </h2>
            <div className="mt-8 space-y-6 text-muted-foreground">
              <p className="text-lg">
                Decisra is designed around one idea: when a decision matters,
                structure matters more than tools.
              </p>
              <div className="rounded-xl border border-border bg-card p-6">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <span>No accounts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <span>No setup</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <span>No persistence</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <span>No dashboards</span>
                  </li>
                </ul>
              </div>
              <p className="text-lg font-medium text-foreground">
                You enter, decide, and leave.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — The Flow */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <span className="text-sm font-medium uppercase tracking-widest text-accent">
              The Process
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">
              The Decisra Flow
            </h2>

            <div className="mt-12 space-y-12">
              {/* Step 1 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-background text-accent">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-xs text-accent">Step 01</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">
                    Start a Session
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    No sign-up. No login. No identity required.
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Starting a session generates a live audio room you can
                    immediately share.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-background text-accent">
                  <LayoutList className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-xs text-accent">Step 02</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">
                    Choose Session Type
                  </h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-card p-5">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">Normal Session</h4>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <li>Open discussion</li>
                        <li>No enforced structure</li>
                        <li>Useful for alignment or exploration</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border-2 border-accent bg-card p-5">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-accent" />
                        <h4 className="font-semibold">Verdict Session</h4>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <li>Designed for decisions</li>
                        <li>Requires a defined scope</li>
                        <li>Enables scoped AI assistance</li>
                      </ul>
                    </div>
                  </div>
                  <p className="mt-4 text-sm italic text-muted-foreground">
                    You can't "accidentally" start a Verdict Session without
                    intention.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-background text-accent">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-xs text-accent">Step 03</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">
                    Define the Scope
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    Verdict Sessions Only
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Scope = what is being decided. It's visible to everyone
                    throughout the session and cannot be edited mid-session.
                  </p>
                  <p className="mt-3 font-medium text-foreground">
                    The scope acts as a guardrail — keeping the conversation
                    anchored.
                  </p>
                  <div className="mt-4 rounded-lg border border-border bg-card/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">
                        Optional context:
                      </strong>{" "}
                      Background, constraints, links or notes. Always optional.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-background text-accent">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-xs text-accent">Step 04</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">
                    Talk
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    Live Audio
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Audio-only by design. Reduces cognitive load. Keeps focus
                    on the discussion.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>• Guests can join freely</li>
                    <li>• Observers allowed</li>
                    <li>• No recording</li>
                    <li>• No transcripts</li>
                  </ul>
                  <p className="mt-4 font-medium text-foreground">
                    If it's not spoken, it doesn't exist.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-background text-accent">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-xs text-accent">Step 05</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">
                    Use Scoped AI
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    Optional
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    AI is optional, has limited usage, and is bound strictly to
                    scope. It helps clarify, summarize viewpoints, or surface
                    trade-offs.
                  </p>
                  <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm font-medium text-foreground">
                      AI does not decide. AI does not override participants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — What Decisra Does Not Do */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              What Decisra intentionally avoids
            </h2>
            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    No stored session history
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    No decision enforcement
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    No post-call artifacts
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">No analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    No participant scoring
                  </span>
                </li>
              </ul>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              These are planned features — not Phase-1 promises.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 — Why This Design Works */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Why this flow matters
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Less drift",
                "Less repetition",
                "More clarity",
                "Faster decisions",
                "Lower friction",
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
              The goal isn't speed.{" "}
              <span className="font-medium text-foreground">
                The goal is clarity.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 — When to Use Each Session Type */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              When to use each session type
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-display text-lg font-semibold">
                    Use Normal Sessions when:
                  </h3>
                </div>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>• Exploring ideas</li>
                  <li>• Aligning perspectives</li>
                  <li>• No immediate decision required</li>
                </ul>
              </div>
              <div className="rounded-xl border-2 border-accent bg-card p-6">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-accent" />
                  <h3 className="font-display text-lg font-semibold">
                    Use Verdict Sessions when:
                  </h3>
                </div>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>• A decision must be made</li>
                  <li>• Scope is clear</li>
                  <li>• AI assistance can help thinking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Ready to try a decision-focused conversation?
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link href="/session/new">Start a Session</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
