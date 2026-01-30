"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, Clock, MessageSquare, HelpCircle, Mail } from "lucide-react";

type TierFeature = {
  text: string;
  available?: boolean;
  planned?: boolean;
};

type Tier = {
  name: string;
  label: string;
  labelStyle: string;
  description: string;
  price: string;
  priceNote: string;
  features: TierFeature[];
  cta: string;
  ctaLink?: string;
  current?: boolean;
  planned?: boolean;
  enterprise?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Free",
    label: "Available",
    labelStyle: "bg-success/20 text-success",
    description:
      "Everything you need to run focused conversations and decision-oriented sessions.",
    price: "$0",
    priceNote: "Free during early access.",
    features: [
      { text: "Unlimited Normal Sessions (30 mins each session)", available: true },
      { text: "Verdict Sessions with scoped AI (10 AI Request)", available: true },
      { text: "Mandatory scope & optional context", available: true },
      { text: "Guests & observers", available: true },
      { text: "No account required", available: true },
    ],
    cta: "Start a Session",
    ctaLink: "/session/new",
    current: true,
  },
  {
    name: "Pro",
    label: "Planned",
    labelStyle: "bg-accent/20 text-accent",
    description:
      "For individuals who want continuity, memory, and deeper insight.",
    price: "Soon",
    priceNote: "Not available yet. Join the waitlist.",
    features: [
      { text: "Verdict session history", planned: true },
      { text: "Decision summaries (AI-generated)", planned: true },
      { text: "Increased AI usage limits", planned: true },
      { text: "Private sessions", planned: true },
      { text: "Session artifacts", planned: true },
    ],
    cta: "Request Early Access",
    planned: true,
  },
  {
    name: "Team / Enterprise",
    label: "Planned",
    labelStyle: "bg-secondary text-muted-foreground",
    description: "For teams making decisions together — repeatedly.",
    price: "Custom",
    priceNote: "Early conversations only.",
    features: [
      { text: "Team workspaces", planned: true },
      { text: "Shared decision history", planned: true },
      { text: "Observer AI", planned: true },
      { text: "Light analytics", planned: true },
      { text: "Custom usage limits", planned: true },
      { text: "Priority onboarding", planned: true },
    ],
    cta: "Contact Us",
    planned: true,
    enterprise: true,
  },
];

export default function PricingPage() {
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-accent">
              Early Access
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              Simple pricing. Built to grow with usage.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Decisra is currently free to use. Paid plans are planned as
              advanced features are introduced.
            </p>
            <p className="mt-4 text-sm text-muted-foreground/80">
              No credit card required. No hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <h2 className="mb-12 text-center font-display text-2xl font-bold md:text-3xl">
            Plans (Early Access)
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 ${
                  tier.current
                    ? "border-accent/50 bg-gradient-to-b from-accent/10 to-background shadow-lg"
                    : "border-border bg-card/50 hover:border-border/80"
                }`}
              >
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${tier.labelStyle}`}
                >
                  {tier.planned && <Clock className="h-3 w-3" />}
                  {tier.label}
                </div>

                <h3 className="mt-4 font-display text-xl font-semibold">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tier.description}
                </p>

                <div className="mt-6">
                  <span className="font-display text-3xl font-bold">
                    {tier.price}
                  </span>
                  {tier.price === "$0" && (
                    <span className="text-muted-foreground"> / forever</span>
                  )}
                </div>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3 text-sm">
                      {feature.planned ? (
                        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <Check className="h-4 w-4 shrink-0 text-success" />
                      )}
                      <span className={feature.planned ? "text-muted-foreground" : ""}>
                        {feature.text}
                        {feature.planned && (
                          <span className="ml-1 text-xs">(planned)</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-xs text-muted-foreground">
                  {tier.priceNote}
                </p>

                {tier.ctaLink ? (
                  <Button asChild variant="hero" className="mt-4 w-full">
                    <Link href={tier.ctaLink}>{tier.cta}</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="mt-4 w-full">
                    <Link href="/contact">{tier.cta}</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What "Planned" Means */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                What "Planned" means
              </h2>
            </div>

            <p className="mt-6 text-lg text-muted-foreground">
              Planned features are not available today. They are ideas under
              validation — not promises.
            </p>

            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>Pricing may evolve</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>Features may change</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span>Early feedback shapes roadmap</span>
                </li>
              </ul>
            </div>

            <p className="mt-6 font-medium text-foreground">
              We're validating demand before building complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Why Pricing Exists Now */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Why show pricing before charging?
              </h2>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "To understand demand",
                "To talk to real users",
                "To build the right features",
                "To avoid building things nobody wants",
              ].map((reason) => (
                <div
                  key={reason}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <Check className="h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm">{reason}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-lg text-muted-foreground">
              Early access is about learning, not locking users in.
            </p>
          </div>
        </div>
      </section>

      {/* Early Access CTA */}
      <section className="border-t border-border bg-accent/5 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Interested in what's coming next?
            </h2>
            <p className="mt-4 text-muted-foreground">
              If you'd like early access to upcoming features or want to
              influence the roadmap, we'd love to hear from you.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link href="/contact" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Request Early Access
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="border-t border-border py-8">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs text-muted-foreground/60">
            Decisra is an early-stage product. Features and pricing are subject
            to change.
          </p>
        </div>
      </section>
    </main>
  );
}
