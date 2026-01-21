import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SessionsIndexPage() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Sessions</h1>
          <p className="mt-4 text-muted-foreground">
            Decisra sessions are live and ephemeral. Session history will come
            later.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hero" size="lg">
              <Link href="/session/new">Start a Session</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/session-types">Learn about session types</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
