import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import Link from "next/link";

type TierFeature = {
  text: string;
  available?: boolean;
  planned?: boolean;
};

type Tier = {
  name: string;
  description: string;
  price: string;
  current?: boolean;
  planned?: boolean;
  features: TierFeature[];
};

const tiers: Tier[] = [
  {
    name: "Free",
    description: "Everything you need to start making decisions.",
    price: "$0",
    current: true,
    features: [
      { text: "Audio-only sessions", available: true },
      { text: "Normal & Verdict modes", available: true },
      { text: "Scoped AI assistance", available: true },
      { text: "Unlimited guests", available: true },
    ],
  },
  {
    name: "Pro",
    description: "For teams who need history and deeper insights.",
    price: "Soon",
    planned: true,
    features: [
      { text: "Everything in Free", available: true },
      { text: "Session history", planned: true },
      { text: "Decision summaries", planned: true },
      { text: "Extended AI limits", planned: true },
    ],
  },
  {
    name: "Team",
    description: "For organizations with structured decision-making needs.",
    price: "Soon",
    planned: true,
    features: [
      { text: "Everything in Pro", available: true },
      { text: "Team workspaces", planned: true },
      { text: "Observer AI", planned: true },
      { text: "Analytics dashboard", planned: true },
    ],
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="relative py-32">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-accent">
            Early Access
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
            Intentionally simple.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Decisra is currently free to use. Advanced features are planned for future paid tiers.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 ${
                tier.current 
                  ? 'border-accent/50 bg-gradient-to-b from-accent/10 to-background shadow-lg glow-accent' 
                  : 'border-border bg-card/50 hover:border-border/80'
              }`}
            >
              {tier.current && (
                <div className="absolute right-4 top-4 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
                  Available Now
                </div>
              )}
              {tier.planned && (
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </div>
              )}

              <h3 className="font-display text-xl font-semibold">{tier.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              
              <div className="mt-6">
                <span className="font-display text-3xl font-bold">{tier.price}</span>
                {tier.price !== "Soon" && <span className="text-muted-foreground"> / forever</span>}
              </div>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3 text-sm">
                    {feature.planned ? (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Check className="h-4 w-4 text-success" />
                    )}
                    <span className={feature.planned ? 'text-muted-foreground' : ''}>
                      {feature.text}
                      {feature.planned && <span className="ml-1 text-xs">(planned)</span>}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.current ? (
                <Link href="/session/new" className="mt-8 block">
                  <Button className="w-full" variant="hero">
                    Start Free
                  </Button>
                </Link>
              ) : (
                <Link href="/contact" className="mt-8 block">
                  <Button className="w-full" variant="outline">
                    Request Early Access
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
