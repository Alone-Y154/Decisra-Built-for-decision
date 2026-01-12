"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Mail,
  Send,
  MessageSquare,
  Users,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

const contactSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
  role: z.string().optional(),
  teamSize: z.string().optional(),
  interestType: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const roleOptions = ["Founder", "Manager", "Individual", "Other"];
const teamSizeOptions = ["1", "2–5", "6–20", "20+"];
const interestOptions = ["Early access", "Team usage", "Feedback", "General question"];

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});
  const [formData, setFormData] = useState<ContactFormData>({
    email: "",
    message: "",
    role: "",
    teamSize: "",
    interestType: "",
  });

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call when backend is ready)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message sent",
      description:
        "We'll get back to you when it makes sense to continue the conversation.",
    });
  };

  if (isSubmitted) {
    return (
      <main className="pt-16">
        <section className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h1 className="mt-6 font-display text-2xl font-bold md:text-3xl">
                Message received
              </h1>
              <p className="mt-4 text-muted-foreground">
                We're a small team building Decisra carefully. We read every
                message and reply when it makes sense to continue the
                conversation.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild variant="hero">
                  <Link href="/sessions/new">Start a Session</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold md:text-5xl">
              Get in touch
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Decisra is in early access. If you're interested in upcoming
              features, team usage, or have feedback — we'd love to hear from
              you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-xl">
            <h2 className="font-display text-xl font-semibold">
              Tell us a bit about you
            </h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Email - Required */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Message - Required */}
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="message"
                  placeholder="What are you hoping to use Decisra for?"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground ${
                    errors.message ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
              </div>

              {/* Optional Fields */}
              <div className="rounded-xl border border-border bg-card/50 p-6">
                <p className="text-sm text-muted-foreground">
                  Optional — helps us understand you better
                </p>

                <div className="mt-4 space-y-4">
                  {/* Role */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <div className="flex flex-wrap gap-2">
                      {roleOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            handleChange(
                              "role",
                              formData.role === option ? "" : option
                            )
                          }
                          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            formData.role === option
                              ? "border-accent bg-accent/20 text-accent"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Team Size */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Team size</label>
                    <div className="flex flex-wrap gap-2">
                      {teamSizeOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            handleChange(
                              "teamSize",
                              formData.teamSize === option ? "" : option
                            )
                          }
                          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            formData.teamSize === option
                              ? "border-accent bg-accent/20 text-accent"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interest Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      I'm interested in
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            handleChange(
                              "interestType",
                              formData.interestType === option ? "" : option
                            )
                          }
                          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            formData.interestType === option
                              ? "border-accent bg-accent/20 text-accent"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              We're a small team building Decisra carefully. We read every
              message and reply when it makes sense to continue the
              conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Alternate Contact */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-xl text-center">
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Prefer email?</h3>
            </div>
            <p className="mt-2 text-muted-foreground">
              Reach us at{" "}
              <a
                href="mailto:hello@decisra.app"
                className="text-accent underline-offset-4 hover:underline"
              >
                hello@decisra.app
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Why Reach Out Section */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold">
                When should you contact us?
              </h2>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm text-muted-foreground">
                  You want early access to planned features
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm text-muted-foreground">
                  You're considering team usage
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm text-muted-foreground">
                  You have feedback after using a session
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm text-muted-foreground">
                  You're curious about the roadmap
                </span>
              </div>
            </div>

            <p className="mt-6 font-medium text-foreground">
              If it's about decisions, it's relevant.
            </p>
          </div>
        </div>
      </section>

      {/* Early-Stage Transparency */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-2xl font-bold">
              A note on early access
            </h2>
            <p className="mt-6 text-muted-foreground">
              Decisra is intentionally simple right now. Some features shown on
              the pricing page are planned and may change.
            </p>
            <p className="mt-4 font-medium text-foreground">
              Your input helps shape what gets built next.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold">
              Interested in decision-focused conversations?
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link href="/sessions/new">Start a Session</Link>
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
