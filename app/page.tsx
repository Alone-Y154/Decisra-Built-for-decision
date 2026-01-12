import { Button } from "@/components/ui/button";
import { ArrowRight, Play, RefreshCw, Compass, VolumeX, Bot, MessageSquare, Scale, Eye, Mic, Target, Brain, ShieldCheck, ListChecks, Ban, Rocket, Users, Lightbulb, Heart, MessageCircle, DoorOpen, Mail, Check, Clock, LayoutList } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
          <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

        <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
          <div className="mb-8 animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">No signup required — start a session now</span>
          </div>

          <h1 className="animate-fade-in-up font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl" style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient">Decisions deserve more</span>
            <br />
            <span className="text-gradient-accent">than meetings.</span>
          </h1>

          <p className="mt-6 max-w-2xl animate-fade-in-up text-lg text-muted-foreground md:text-xl" style={{ animationDelay: '0.2s' }}>
            Decisra is a live, audio-only decision space where conversations stay focused, 
            scoped, and supported by AI — without accounts, friction, or noise.
          </p>

          <p className="mt-4 animate-fade-in-up text-sm text-muted-foreground/80" style={{ animationDelay: '0.25s' }}>
            Built for moments where clarity matters more than discussion.
          </p>

          <div className="mt-10 flex animate-fade-in-up flex-col gap-4 sm:flex-row" style={{ animationDelay: '0.3s' }}>
            <Button asChild variant="hero" size="xl">
              <Link href="/sessions/new">
                Start a Session
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href="/how-it-works">
                <Play className="h-4 w-4" />
                See How It Works
              </Link>
            </Button>
          </div>

          <Link 
            href="/pricing" 
            className="mt-6 animate-fade-in-up text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
            style={{ animationDelay: '0.35s' }}
          >
            View Pricing (Early Access)
          </Link>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-float">
            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="h-8 w-px bg-gradient-to-b from-muted-foreground/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section id="problems" className="relative py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-accent">
              Why Meetings Fail
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Conversations drift. Decisions don't happen.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Outcomes get lost once the call ends. The same discussion repeats next week.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: RefreshCw,
                title: "Meetings go in circles",
                description: "The same points get repeated. The same arguments resurface. Nothing gets resolved.",
                color: "text-destructive",
              },
              {
                icon: Compass,
                title: "Context gets lost",
                description: "People join with different knowledge. Time is spent re-explaining before real thinking begins.",
                color: "text-warning",
              },
              {
                icon: VolumeX,
                title: "Opinions overpower structure",
                description: "Louder voices dominate. Important points get buried. Decisions defer to politics, not logic.",
                color: "text-primary",
              },
              {
                icon: Bot,
                title: "AI interrupts, not assists",
                description: "Generic AI summarizes everything without understanding importance. Distraction, not facilitation.",
                color: "text-muted-foreground",
              },
            ].map((problem, index) => (
              <div
                key={problem.title}
                className="border-gradient group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:translate-y-[-4px]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-card to-background opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="relative">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary ${problem.color}`}>
                    <problem.icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="mb-2 font-display text-lg font-semibold">
                    {problem.title}
                  </h3>
                  
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {problem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-12 max-w-xl text-center text-muted-foreground">
            Decisra exists for the moments where a decision actually needs to be made.
          </p>
        </div>
      </section>

      {/* What Is Decisra Section */}
      <section id="what-is-decisra" className="relative py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <span className="text-sm font-medium uppercase tracking-widest text-accent">
                What is Decisra?
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
                Not another meeting tool.<br />
                <span className="text-gradient-accent">A decision environment.</span>
              </h2>
              
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Decisra is a live audio space built specifically for reaching decisions. 
                Structured entry. Scoped conversations. Optional AI assistance that 
                knows its boundaries.
              </p>
              
              <p className="mt-4 text-muted-foreground">
                No recordings. No dashboards. No distractions.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mic, text: "Audio-only live sessions" },
                { icon: Target, text: "Decision-first structure" },
                { icon: Compass, text: "Scope always visible" },
                { icon: Bot, text: "AI that stays within context" },
                { icon: DoorOpen, text: "No sign-ups required" },
              ].map((item, index) => (
                <div
                  key={item.text}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card/50 p-4 transition-all duration-300 hover:border-accent/30 hover:bg-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Session Types Section */}
      <section id="sessions" className="relative py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-accent">
              Session Types
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Two ways to talk. One way to decide.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the structure that fits. Decisra adapts without losing its principles.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                name: "Normal Session",
                description: "Free-flow conversations for alignment, discussion, or exploration. Useful when you need to think together without forcing a conclusion.",
                features: ["Open conversation", "No enforced structure", "No AI limits"],
                gradient: "from-primary/20 to-primary/5",
                borderColor: "border-primary/30",
              },
              {
                icon: Scale,
                name: "Verdict Session",
                description: "Built for decisions. Mandatory scope keeps everyone aligned. Optional context capsule provides background. AI assistance stays within bounds.",
                features: [
                  "Mandatory scope definition",
                  "Optional context capsule",
                  "AI constrained to scope",
                  "Designed to prevent drift",
                ],
                note: "The goal isn't agreement. It's clarity.",
                gradient: "from-accent/20 to-accent/5",
                borderColor: "border-accent/30",
                featured: true,
              },
              {
                icon: Eye,
                name: "Observer Mode",
                description: "Many need visibility, few should participate. Observers listen without disrupting the conversation flow.",
                features: ["Listen-only access", "Limited question quota", "Can 'poke' for clarification"],
                gradient: "from-muted to-background",
                borderColor: "border-border",
              },
            ].map((session) => (
              <div
                key={session.name}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b ${session.gradient} p-8 transition-all duration-300 hover:translate-y-[-4px] ${session.borderColor} ${session.featured ? 'lg:scale-105 shadow-lg glow-accent' : ''}`}
              >
                {session.featured && (
                  <div className="absolute right-4 top-4 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
                    Core Feature
                  </div>
                )}

                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${session.featured ? 'bg-accent/20 text-accent' : 'bg-secondary text-foreground'}`}>
                  <session.icon className="h-7 w-7" />
                </div>

                <h3 className="mb-3 font-display text-xl font-semibold">
                  {session.name}
                </h3>

                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {session.description}
                </p>

                <ul className="space-y-2">
                  {session.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {session.note && (
                  <p className="mt-6 border-t border-border pt-4 text-sm italic text-accent">
                    {session.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoped AI Section */}
      <section id="ai" className="relative py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="text-sm font-medium uppercase tracking-widest text-accent">
                Scoped AI
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
                AI that knows when to stay quiet.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                In Verdict Sessions, AI assistance is limited, scoped, and intentional.
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-background">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Brain className="h-7 w-7" />
                  </div>
                  
                  <h3 className="mb-4 font-display text-xl font-semibold">
                    A thinking aid, not a decision maker.
                  </h3>
                  
                  <p className="mb-6 leading-relaxed text-muted-foreground">
                    AI can synthesize viewpoints, list trade-offs, and highlight risks. 
                    But it operates strictly within your session's scope. Ask something 
                    outside the boundaries, and it refuses to answer.
                  </p>

                  <p className="text-sm text-muted-foreground/80">
                    No hallucinated context. No off-topic tangents.
                  </p>
                </div>

                <div className="border-t border-border bg-secondary/30 p-8 md:border-l md:border-t-0 md:p-12">
                  <p className="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    How it works
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      {
                        icon: ShieldCheck,
                        text: "Responds only within defined scope",
                      },
                      {
                        icon: Ban,
                        text: "No broad brainstorming",
                      },
                      {
                        icon: ListChecks,
                        text: "Limited interactions per user",
                      },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-accent">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-lg border border-accent/20 bg-accent/5 p-4">
                    <p className="text-sm text-accent">
                      Decisra uses AI as a thinking aid — not a decision maker.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-accent">
              How It Works
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Simple by design.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No setup. No dashboards. No friction.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="relative">
              <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-accent via-accent/50 to-transparent md:left-1/2 md:block md:-translate-x-px" />

              <div className="space-y-8 md:space-y-0">
                {[
                  {
                    icon: Play,
                    step: "01",
                    title: "Start a session",
                    description: "No account required. Just start.",
                  },
                  {
                    icon: LayoutList,
                    step: "02",
                    title: "Choose session type",
                    description: "Normal for discussion. Verdict for decisions.",
                  },
                  {
                    icon: Target,
                    step: "03",
                    title: "Define the scope",
                    description: "Mandatory for Verdict. Sets the boundaries.",
                  },
                  {
                    icon: Mic,
                    step: "04",
                    title: "Talk",
                    description: "Audio-only, focused conversation.",
                  },
                  {
                    icon: Bot,
                    step: "05",
                    title: "Use AI if needed",
                    description: "Within scope only. Limited interactions.",
                  },
                ].map((step, index) => (
                  <div
                    key={step.step}
                    className={`relative flex items-start gap-6 md:gap-12 ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className={`inline-block rounded-xl border border-border bg-card p-6 ${index % 2 === 0 ? '' : ''}`}>
                        <p className="mb-2 font-mono text-xs text-accent">{step.step}</p>
                        <h3 className="mb-2 font-display text-lg font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>

                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-background text-accent md:absolute md:left-1/2 md:-translate-x-1/2">
                      <step.icon className="h-5 w-5" />
                    </div>

                    <div className="hidden flex-1 md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mx-auto mt-16 max-w-md text-center text-muted-foreground">
            That's it. No setup. No dashboards. No friction.
          </p>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="who-its-for" className="relative py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <span className="text-sm font-medium uppercase tracking-widest text-accent">
              Who It's For
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              If a conversation matters, Decisra fits.
            </h2>
            
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {[
                { icon: Rocket, text: "Founders making product calls" },
                { icon: Users, text: "Small teams aligning on direction" },
                { icon: Lightbulb, text: "Mentors and advisors" },
                { icon: Heart, text: "Friends making important choices" },
                { icon: MessageCircle, text: "Anyone tired of circular conversations" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 transition-all duration-300 hover:border-accent/30 hover:bg-card/80"
                >
                  <item.icon className="h-5 w-5 text-accent" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-6">
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

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
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
            ].map((tier) => (
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
                  {tier.features.map((feature) => {
                    const isPlanned = "planned" in feature && feature.planned === true;
                    return (
                      <li key={feature.text} className="flex items-center gap-3 text-sm">
                        {isPlanned ? (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Check className="h-4 w-4 text-success" />
                        )}
                        <span className={isPlanned ? 'text-muted-foreground' : ''}>
                          {feature.text}
                          {isPlanned && <span className="ml-1 text-xs">(planned)</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {tier.current ? (
                  <Link href="/sessions/new" className="mt-8 block">
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

      {/* Trust Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl rounded-xl border border-border/50 bg-card/30 p-8 text-center">
            <p className="text-muted-foreground">
              Decisra is an early product. We're focused on learning how people actually 
              make decisions — before adding complexity.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border border-accent/20 bg-gradient-to-b from-card to-background p-12 text-center shadow-lg glow-accent md:p-16">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Start a decision-focused conversation.
            </h2>
            
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              No signup. No friction. Just clarity.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="hero">
                <Link href="/sessions/new">
                  Start a Session
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
