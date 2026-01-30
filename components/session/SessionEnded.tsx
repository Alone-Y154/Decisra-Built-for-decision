import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SessionEndedProps {
  onStartNew: () => void;
  variant?: "ended" | "left" | "missing";
}

export function SessionEnded({ onStartNew, variant = "ended" }: SessionEndedProps) {
  const title =
    variant === "left"
      ? "You left the session."
      : variant === "missing"
        ? "Session not found."
        : "This session has ended.";

  const description =
    variant === "left"
      ? "You can start a new session anytime."
      : variant === "missing"
        ? "It may have ended already, or the link is invalid."
        : "Decisra sessions are live and temporary by design.";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          {title}
        </h1>
        <p className="text-muted-foreground mb-8">
          {description}
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={onStartNew} size="lg" variant="hero">
            Start a New Session
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/pricing">View Pricing (Early Access)</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
