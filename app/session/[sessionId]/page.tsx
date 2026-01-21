"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JoinPreview } from "@/components/session/JoinPreview";
import type { Session } from "@/lib/types/session";

type ApiError = { error: string };

type JoinResponse = {
  role?: "host" | "participant" | "observer";
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

export default function SessionPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL, []);

  const hostToken = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!sessionId) return null;
    return sessionStorage.getItem(`decisra:hostToken:${sessionId}`);
  }, [sessionId]);

  const isHostCandidate = !!hostToken;

  const [session, setSession] = useState<Session | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

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

  const handleJoin = async (role: "participant" | "observer", name?: string) => {
    if (!sessionId) return;
    setIsJoining(true);
    try {
      const endpoint = apiBaseUrl
        ? `${apiBaseUrl}/api/session/${encodeURIComponent(sessionId)}/join`
        : `/api/session/${encodeURIComponent(sessionId)}/join`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (hostToken) {
        headers.Authorization = `Bearer ${hostToken}`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ role }),
      });

      const data = (await res.json()) as unknown;
      if (!res.ok) {
        const maybeError = data as Partial<ApiError>;
        throw new Error(
          typeof maybeError?.error === "string"
            ? maybeError.error
            : "Failed to join session"
        );
      }

      const join = data as JoinResponse;

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `decisra:join:${sessionId}`,
          JSON.stringify({
            requestedRole: role,
            audioToken: join?.audioToken,
            assignedRole: join?.role,
          })
        );
        if (name) {
          sessionStorage.setItem(`decisra:displayName:${sessionId}`, name);
        }
      }

      router.push(`/session/${sessionId}/live`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join session";
      setLoadError(message);
    } finally {
      setIsJoining(false);
    }
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

  return (
    <JoinPreview
      session={session}
      onJoin={(role, name) => {
        // Host does not choose role; backend assigns host when Authorization is present.
        const requestedRole = isHostCandidate ? "participant" : role;
        handleJoin(requestedRole, name);
      }}
      isHost={isHostCandidate}
      isJoining={isJoining}
      error={loadError}
    />
  );
}
