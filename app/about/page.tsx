/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Target,
  AudioLines,
  Layers,
  Minimize2,
  Eye,
  Users,
} from "lucide-react";

export default function About() {
  return (
    <main className="">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-accent">
              About
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              Why Decisra exists
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Because important decisions deserve better conversations.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: The Problem */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Conversations aren't the problem. Drift is.
              </h2>
            </div>

            <p className="mt-8 text-lg text-muted-foreground">
              Most important decisions don't fail because people don't talk.
              They fail because conversations lose structure.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>Discussions wander</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>Context repeats</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>Decisions get delayed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>Tools optimize for talking, not deciding</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" />
                  <span>AI adds noise instead of clarity</span>
                </li>
              </ul>
            </div>

            <p className="mt-8 font-medium text-foreground">
              Decisra exists to fix that specific problem — and nothing else.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: What Decisra Is */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <AudioLines className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                A decision environment — not a meeting tool
              </h2>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
                <h3 className="font-semibold text-foreground">What it is</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Live</li>
                  <li>• Audio-only</li>
                  <li>• Scoped</li>
                  <li>• Intentional</li>
                  <li>• Temporary by design</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">What it is not</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Not a productivity suite</li>
                  <li>• Not a meeting recorder</li>
                  <li>• Not a task manager</li>
                  <li>• Not an AI decision-maker</li>
                </ul>
              </div>
            </div>

            <p className="mt-8 text-lg text-muted-foreground">
              Decisra doesn't try to own your workflow.
              <br />
              <span className="font-medium text-foreground">
                It exists only for the moment a decision is being discussed.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Why Structure Matters */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <Layers className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Structure creates clarity
              </h2>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Scope focuses attention",
                "Constraints reduce noise",
                "Limited AI increases usefulness",
                "Ephemeral sessions reduce performative behavior",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-card p-4">
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-lg font-medium text-foreground">
                That’s why when everything is possible, nothing gets decided.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Simplicity */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <Minimize2 className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Simplicity is a feature
              </h2>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>No accounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>No dashboards</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>No saved history (yet)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>No metrics (yet)</span>
                </li>
              </ul>
            </div>

            <p className="mt-8 text-muted-foreground">
              These are not missing features.
              <br />
              <span className="font-medium text-foreground">
                They are deliberate omissions in Phase-1.
              </span>
            </p>

            <p className="mt-4 text-sm text-muted-foreground/80">
              Complexity is added only when it proves necessary.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Early Stage Transparency */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Built in the open
              </h2>
            </div>

            <p className="mt-8 text-lg text-muted-foreground">
              Decisra is an early-stage product.
              We're focused on learning how people actually make decisions — before scaling features or pricing.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Feedback shapes roadmap",
                "Paid features are planned, not promised",
                "Usage matters more than assumptions",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-border bg-card p-4 text-center"
                >
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Who It's For */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Who this is built for
              </h2>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "People making meaningful decisions",
                "Small teams",
                "Founders",
                "Advisors",
                "Anyone tired of circular discussions",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 font-medium text-foreground">
              If clarity matters, Decisra fits.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-accent/5 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-lg text-muted-foreground">
              Decisra is an experiment in better decision conversations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link href="/sessions/new">Start a Session</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Microcopy */}
      <section className="border-t border-border py-8">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground/60 italic">
            Decisions are moments. Decisra is built for those moments.
          </p>
        </div>
      </section>
    </main>
  );
}
