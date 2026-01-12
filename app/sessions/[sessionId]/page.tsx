"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SessionHeader } from "@/components/session/SessionHeader";
import { AudioControls } from "@/components/session/AudioControls";
import { ParticipantsPanel } from "@/components/session/ParticipantsPanel";
import { AIPanel } from "@/components/session/AIPanel";
import { SessionSharePanel } from "@/components/session/SessionSharePanel";
import { EndSessionModal } from "@/components/session/EndSessionModal";
import { SessionEnded } from "@/components/session/SessionEnded";
import { JoinPreview } from "@/components/session/JoinPreview";

export interface Session {
  id: string;
  type: "normal" | "verdict";
  scope?: string;
  context?: string;
}

const getMockSession = (
  sessionId: string,
  overrides?: Pick<Session, "scope" | "context">
): Session => {
  const isVerdict = sessionId.startsWith("v");
  const base: Session = {
    id: sessionId,
    type: isVerdict ? "verdict" : "normal",
    scope: isVerdict ? "Should we proceed with the Q1 product launch?" : undefined,
    context: isVerdict
      ? "Budget approved. Team capacity at 80%. Market timing uncertain."
      : undefined,
  };

  if (!isVerdict) return base;
  if (!overrides) return base;

  return {
    ...base,
    ...(overrides.scope ? { scope: overrides.scope } : null),
    ...(overrides.context ? { context: overrides.context } : null),
  };
};

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params?.sessionId as string;

  const isHost = searchParams.get("host") === "true";
  const scopeParam = searchParams.get("scope") || undefined;
  const contextParam = searchParams.get("context") || undefined;

  const sessionOverrides = useMemo(() => {
    if (!sessionId?.startsWith("v")) return undefined;
    if (!scopeParam && !contextParam) return undefined;
    return { scope: scopeParam, context: contextParam };
  }, [contextParam, scopeParam, sessionId]);

  const [session, setSession] = useState<Session | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [userRole, setUserRole] = useState<
    "host" | "participant" | "observer" | null
  >(null);
  const [displayName, setDisplayName] = useState<string>("You");
  const [isEnded, setIsEnded] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (sessionId) {
      const sessionData = getMockSession(sessionId, sessionOverrides);
      setSession(sessionData);
    }
  }, [sessionId, sessionOverrides]);

  const handleJoinSession = (role: "participant" | "observer", name?: string) => {
    const actualRole = isHost ? "host" : role;
    setUserRole(actualRole);
    setDisplayName(name || "You");
    setHasJoined(true);
    setIsConnected(true);
    setIsMuted(role === "observer");
  };

  const handleToggleMute = () => {
    if (userRole === "observer") return;
    setIsMuted(!isMuted);
  };

  const handleLeaveSession = () => {
    setShowEndModal(true);
  };

  const handleConfirmEnd = () => {
    setShowEndModal(false);
    setIsEnded(true);
    setIsConnected(false);
  };

  const handleStartNew = () => {
    router.push("/sessions/new");
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (!hasJoined) {
    return <JoinPreview session={session} onJoin={handleJoinSession} isHost={isHost} />;
  }

  if (isEnded) {
    return <SessionEnded onStartNew={handleStartNew} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SessionHeader session={session} />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AudioControls
              isConnected={isConnected}
              isMuted={isMuted}
              isObserver={userRole === "observer"}
              onToggleMute={handleToggleMute}
              onLeave={handleLeaveSession}
            />

            <ParticipantsPanel userRole={userRole} displayName={displayName} />
          </div>

          <div className="space-y-6">
            {session.type === "verdict" && (
              <AIPanel scope={session.scope} context={session.context} />
            )}

            <SessionSharePanel sessionId={session.id} />
          </div>
        </div>
      </main>

      <EndSessionModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleConfirmEnd}
      />
    </div>
  );
}
