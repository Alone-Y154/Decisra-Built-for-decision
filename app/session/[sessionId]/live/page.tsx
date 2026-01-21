"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { SessionHeader } from "@/components/session/SessionHeader";
import { AudioControls } from "@/components/session/AudioControls";
import { ParticipantsPanel } from "@/components/session/ParticipantsPanel";
import { AIPanel } from "@/components/session/AIPanel";
import { SessionSharePanel } from "@/components/session/SessionSharePanel";
import { EndSessionModal } from "@/components/session/EndSessionModal";
import { SessionEnded } from "@/components/session/SessionEnded";

import type { Session } from "@/lib/types/session";

type ApiError = { error: string };

type JoinStorage = {
  requestedRole?: "participant" | "observer";
  assignedRole?: "host" | "participant" | "observer";
  audioToken?: string;
};

const normalizeSession = (data: unknown): Session | null => {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const id = record.id ?? record.sessionId;
  const type = record.type;
  if (typeof id !== "string") return null;
  if (type !== "normal" && type !== "verdict") return null;

  const scope = typeof record.scope === "string" ? record.scope : undefined;
  const context = typeof record.context === "string" ? record.context : undefined;

  return { id, type, scope, context };
};

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL, []);

  const [session, setSession] = useState<Session | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState<string>("You");
  const [userRole, setUserRole] = useState<"host" | "participant" | "observer">(
    "participant"
  );
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const [isEnded, setIsEnded] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    if (isEnded) return;

    const handler = (e: BeforeUnloadEvent) => {
      // Modern browsers ignore custom strings, but this triggers a confirmation dialog.
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isEnded]);

  const hostToken = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!sessionId) return null;
    return sessionStorage.getItem(`decisra:hostToken:${sessionId}`);
  }, [sessionId]);

  const canEndSession = !!hostToken;

  useEffect(() => {
    if (!sessionId) return;

    // If user hasn't joined, send them back to preview.
    const joinRaw =
      typeof window === "undefined"
        ? null
        : sessionStorage.getItem(`decisra:join:${sessionId}`);

    if (!joinRaw) {
      router.replace(`/session/${sessionId}`);
      return;
    }

    try {
      const join = JSON.parse(joinRaw) as JoinStorage;
      const storedName = sessionStorage.getItem(`decisra:displayName:${sessionId}`);
      if (storedName) setDisplayName(storedName);

      // Backend may optionally return an assigned role; otherwise we infer host ability via token.
      const roleFromJoin = join.assignedRole ?? join.requestedRole;
      const effectiveRole: "host" | "participant" | "observer" = hostToken
        ? "host"
        : roleFromJoin === "observer"
          ? "observer"
          : "participant";

      setUserRole(effectiveRole);
      setIsMuted(effectiveRole === "observer");
    } catch {
      router.replace(`/session/${sessionId}`);
    }
  }, [hostToken, router, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const load = async () => {
      setLoadError(null);
      try {
        const endpoint = apiBaseUrl
          ? `${apiBaseUrl}/api/session/${encodeURIComponent(sessionId)}`
          : `/api/session/${encodeURIComponent(sessionId)}`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        const data = (await res.json()) as unknown;
        if (!res.ok) {
          const maybeError = data as Partial<ApiError>;
          throw new Error(
            typeof maybeError?.error === "string"
              ? maybeError.error
              : "Failed to load session"
          );
        }

        const normalized = normalizeSession(data);
        if (!normalized) throw new Error("Invalid session payload");

        if (!cancelled) setSession(normalized);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load session";
        if (!cancelled) setLoadError(message);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, sessionId]);

  const handleToggleMute = () => {
    if (userRole === "observer") return;
    setIsMuted((prev) => !prev);
  };

  const handleLeave = () => {
    if (canEndSession) {
      setShowEndModal(true);
      return;
    }
    router.push(`/session/${sessionId}`);
  };

  const handleConfirmEnd = async () => {
    if (!sessionId) return;
    if (!hostToken) {
      setShowEndModal(false);
      return;
    }

    try {
      const endpoint = apiBaseUrl
        ? `${apiBaseUrl}/api/session/${encodeURIComponent(sessionId)}/end`
        : `/api/session/${encodeURIComponent(sessionId)}/end`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hostToken}`,
        },
      });

      const data = (await res.json()) as unknown;
      if (!res.ok) {
        const maybeError = data as Partial<ApiError>;
        throw new Error(
          typeof maybeError?.error === "string" ? maybeError.error : "Failed to end session"
        );
      }

      setShowEndModal(false);
      setIsEnded(true);
      setIsConnected(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to end session";
      setLoadError(message);
      setShowEndModal(false);
    }
  };

  const handleStartNew = () => {
    router.push("/session/new");
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          {loadError ? loadError : "Loading session..."}
        </p>
      </div>
    );
  }

  if (isEnded) {
    return <SessionEnded onStartNew={handleStartNew} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SessionHeader session={session} />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {loadError && (
          <p className="text-sm text-destructive mb-4">{loadError}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AudioControls
              isConnected={isConnected}
              isMuted={isMuted}
              isObserver={userRole === "observer"}
              onToggleMute={handleToggleMute}
              onLeave={handleLeave}
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
