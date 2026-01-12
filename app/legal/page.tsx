"use client";

export default function LegalPage() {
  return (
    <main className="pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Privacy Policy */}
        <section id="privacy" className="mb-20">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Effective as of January 2025
          </p>

          <div className="space-y-8 text-foreground/90">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Decisra is an early-stage product designed for live,
                decision-focused conversations. We value privacy and
                intentionally collect as little data as possible.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                2. Information We Collect
              </h2>
              <h3 className="text-lg font-medium mb-2">What We Collect</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                During normal use, Decisra may temporarily process:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-4">
                <li>Session metadata (session type, scope, context)</li>
                <li>Real-time audio streams (for live communication only)</li>
                <li>Role selection (host, participant, observer)</li>
                <li>Optional display names (if provided)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This information exists only for the duration of the live
                session.
              </p>

              <h3 className="text-lg font-medium mb-2">What We Do NOT Collect</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We do not collect or store:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>User accounts</li>
                <li>Passwords</li>
                <li>Payment information</li>
                <li>Session recordings</li>
                <li>Transcripts</li>
                <li>Decision outcomes</li>
                <li>Analytics tied to individuals</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                3. Audio & Session Data
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Decisra sessions are live and ephemeral by design.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Audio is not recorded</li>
                <li>Sessions are not stored</li>
                <li>AI context does not persist beyond the session</li>
                <li>When a session ends, associated data is discarded</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. AI Usage</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                In Verdict Sessions, AI assistance is provided within the
                defined session scope.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>AI operates only within session context</li>
                <li>AI does not retain memory across sessions</li>
                <li>AI does not build user profiles</li>
                <li>AI does not make decisions on behalf of users</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Cookies & Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                Decisra does not use advertising cookies or behavioral
                tracking. If this changes, this policy will be updated.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                6. Third-Party Services
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Decisra may rely on third-party infrastructure providers for
                real-time communication and AI assistance. Data is processed
                only as needed to provide the service. No data is sold or
                shared for marketing.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                7. Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                As Decisra evolves, this Privacy Policy may be updated.
                Material changes will be reflected on this page.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about privacy, contact us at{" "}
                <a
                  href="mailto:hello@decisra.app"
                  className="text-primary hover:underline"
                >
                  hello@decisra.app
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <hr className="border-border mb-20" />

        {/* Terms of Service */}
        <section id="terms" className="mb-16">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="space-y-8 text-foreground/90">
            <div>
              <h2 className="text-xl font-semibold mb-3">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By using Decisra, you agree to these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                2. Description of the Service
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Decisra provides live, audio-only sessions for conversations
                and decision-focused discussions.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>The service is provided "as is"</li>
                <li>Features may change</li>
                <li>Some features are planned, not available</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                3. Early-Stage Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Decisra is an early-stage product. The service may change,
                experience interruptions, or be discontinued.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                4. User Responsibilities
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Users agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Use the service lawfully</li>
                <li>Not disrupt sessions maliciously</li>
                <li>Not misuse AI features</li>
                <li>Not attempt to bypass session constraints</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. No Guarantees</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Decisra does not guarantee outcomes, decisions, accuracy of AI
                responses, or availability.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                AI assistance is provided as a support tool, not as advice or a
                decision-making authority.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. No Data Persistence</h2>
              <p className="text-muted-foreground leading-relaxed">
                Users acknowledge that sessions are live and ephemeral, and no
                session data is retained after a session ends.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                7. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Decisra shall not be
                liable for any indirect or consequential damages arising from
                use of the service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate access if the service is misused or
                abused.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by applicable laws in your
                jurisdiction.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions about these terms can be sent to{" "}
                <a
                  href="mailto:hello@decisra.app"
                  className="text-primary hover:underline"
                >
                  hello@decisra.app
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <p className="text-sm text-muted-foreground text-center border-t border-border pt-8">
          Decisra is built for live, focused conversations. Privacy and
          simplicity are intentional design choices.
        </p>
      </div>
    </main>
  );
}
