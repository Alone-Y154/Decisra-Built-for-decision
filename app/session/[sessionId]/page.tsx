"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { JoinPreview } from "@/components/session/JoinPreview";
import { SessionEnded } from "@/components/session/SessionEnded";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/types/session";
import { ApiHttpError, apiFetchJson, apiUrl } from "@/lib/api";
import { fetchSse, safeJsonParse, SseHttpError } from "@/lib/sse";

type JoinRoomResponse = {
  role: "host" | "participant" | "observer";
  roomName: string;
  roomUrl: string;
  dailyToken: string;
};

type CreateJoinRequestResponse = {
  requestId: string;
  status: "pending";
};

type JoinRequestStatusResponse = {
  requestId: string;
  status: "pending" | "denied" | "admitted";
  role: "participant" | "observer" | null;
  roomUrl: string | null;
  dailyToken: string | null;
};

type JoinRequestStreamEvent =
  | { type: "status"; data: JoinRequestStatusResponse }
  | { type: "keepalive" }
  | { type: "ended" };

const normalizeSession = (data: unknown): Session | null => {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const id = record.id ?? record.sessionId;
  const type = record.type;
  if (typeof id !== "string") return null;
  if (type !== "normal" && type !== "verdict") return null;

  const scope = typeof record.scope === "string" ? record.scope : undefined;
  const context = typeof record.context === "string" ? record.context : undefined;

  const expiresAt =
    typeof record.expiresAt === "number" ? record.expiresAt : undefined;

  return { id, type, scope, context, expiresAt };
};

export default function SessionPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params?.sessionId as string;

  const hostToken = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!sessionId) return null;
    return sessionStorage.getItem(`decisra:hostToken:${sessionId}`);
  }, [sessionId]);

  const isHostCandidate = !!hostToken;

  const [session, setSession] = useState<Session | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState(false);
  const [forcedVariant, setForcedVariant] = useState<"ended" | "missing" | null>(
    null
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const [isJoining, setIsJoining] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requestedRole, setRequestedRole] = useState<"participant" | "observer" | null>(
    null
  );
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "pending" | "denied" | "admitted"
  >("idle");
  const [displayName, setDisplayName] = useState<string | null>(null);



  useEffect(() => {
    if (!sessionId) return;

    const endedParam = searchParams?.get("ended");
    const missingParam = searchParams?.get("missing");
    const leftParam = searchParams?.get("left");

    const leftNotice =
      typeof window === "undefined"
        ? null
        : sessionStorage.getItem(`decisra:leftNotice:${sessionId}`);

    // If a user is sent here from /live, ensure they must request permission again.
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`decisra:join:${sessionId}`);
    }

    if (endedParam === "1") {
      setForcedVariant("ended");
      return;
    }

    if (missingParam === "1") {
      setForcedVariant("missing");
      return;
    }

    if (leftParam === "1") {
      setNotice("You left the session. Request access to join again.");
      // Clean URL (and prevent showing the notice again on refresh).
      router.replace(`/session/${sessionId}`);
      return;
    }

    if (leftNotice === "1") {
      setNotice("You left the session. Request access to join again.");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`decisra:leftNotice:${sessionId}`);
      }
    }
  }, [router, searchParams, sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    // Best-effort: pull expiry from storage (host has it right after create).
    // Backend should also include expiresAt in GET /api/session/:id.
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(`decisra:expiresAt:${sessionId}`);
    const parsed = raw ? Number(raw) : NaN;
    if (!Number.isFinite(parsed)) return;
    setExpiresAt(parsed);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const load = async () => {
      setLoadError(null);
      try {
        const { data } = await apiFetchJson<unknown>(
          `/api/session/${encodeURIComponent(sessionId)}`,
          { method: "GET" }
        );

        const normalized = normalizeSession(data);
        if (!normalized) throw new Error("Invalid session payload");
        if (typeof normalized.expiresAt === "number") {
          setExpiresAt(normalized.expiresAt);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              `decisra:expiresAt:${sessionId}`,
              String(normalized.expiresAt)
            );
          }
        }
        if (!cancelled) setSession(normalized);
      } catch (err) {
        if (err instanceof ApiHttpError) {
          if (!cancelled) {
            if (err.status === 410) {
              setIsEnded(true);
              setLoadError(null);
              return;
            }
            if (err.status === 404) {
              setLoadError("Session not found. Check the link and try again.");
              return;
            }
          }
        }

        const message = err instanceof Error ? err.message : "Failed to load session";
        if (!cancelled) setLoadError(message);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (!expiresAt) return;
    if (forcedVariant) return;
    if (isEnded) return;

    const now = Date.now();
    if (now >= expiresAt) {
      setForcedVariant("ended");
      return;
    }

    const ms = Math.max(0, expiresAt - now);
    const timeoutId = window.setTimeout(() => {
      setForcedVariant("ended");
    }, ms);

    return () => window.clearTimeout(timeoutId);
  }, [expiresAt, forcedVariant, isEnded, sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const storedName =
      typeof window === "undefined"
        ? null
        : sessionStorage.getItem(`decisra:displayName:${sessionId}`);
    if (storedName) setDisplayName(storedName);

    const mustReRequest =
      typeof window === "undefined"
        ? false
        : sessionStorage.getItem(`decisra:mustReRequest:${sessionId}`) === "1";

    const fromQuery = searchParams?.get("requestId") ?? null;
    const storedRequestRaw =
      typeof window === "undefined"
        ? null
        : sessionStorage.getItem(`decisra:joinRequest:${sessionId}`);

    // If the user left previously, do not auto-resume any existing request from
    // browser history. They must request again.
    if (mustReRequest) {
      setRequestId(null);
      setRequestedRole(null);
      setRequestStatus("idle");

      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
      }

      if (fromQuery) {
        setNotice("You left the session. Request access to join again.");
        router.replace(`/session/${sessionId}`);
      }

      return;
    }

    if (fromQuery) {
      setRequestId(fromQuery);
      setRequestStatus("pending");
      return;
    }

    if (storedRequestRaw) {
      try {
        const parsed = JSON.parse(storedRequestRaw) as {
          requestId?: string;
          requestedRole?: "participant" | "observer";
        };
        if (typeof parsed.requestId === "string") {
          setRequestId(parsed.requestId);
          setRequestedRole(parsed.requestedRole ?? null);
          setRequestStatus("pending");
        }
      } catch {
        // ignore
      }
    }
  }, [router, searchParams, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (!requestId) return;
    if (isHostCandidate) return;
    if (requestStatus !== "pending") return;

    let cancelled = false;
    let controller: AbortController | null = null;

    let timeoutId: number | null = null;
    const scheduleStream = (ms: number, fn: () => void) => {
      if (cancelled) return;
      const jitter = Math.floor(Math.random() * 250);
      timeoutId = window.setTimeout(fn, ms + jitter);
    };

    const handleAdmitted = (data: JoinRequestStatusResponse) => {
      if (
        data.status === "admitted" &&
        data.role &&
        data.roomUrl &&
        data.dailyToken
      ) {
        setRequestStatus("admitted");

        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `decisra:join:${sessionId}`,
            JSON.stringify({
              assignedRole: data.role,
              roomUrl: data.roomUrl,
              dailyToken: data.dailyToken,
              joinRequestId: requestId,
            })
          );

          // User has been admitted again.
          sessionStorage.removeItem(`decisra:mustReRequest:${sessionId}`);

          if (displayName) {
            sessionStorage.setItem(`decisra:displayName:${sessionId}`, displayName);
          }
        }

        router.push(`/session/${sessionId}/live`);
      }
    };

    const startStream = async () => {
      // Prefer push if backend supports it.
      const streamUrl = apiUrl(
        `/api/session/${encodeURIComponent(sessionId)}/join-request/${encodeURIComponent(
          requestId
        )}/stream`
      );

      controller?.abort();
      controller = new AbortController();

      // Reconnect with gentle backoff if the stream drops.
      let reconnectDelayMs = 750;
      const maxReconnectDelayMs = 8000;

      const computeDelay = () => {
        // Back off hard in the background to avoid constant reconnect loops.
        if (typeof document !== "undefined" && document.hidden) return 15_000;
        return reconnectDelayMs;
      };

      const run = async (): Promise<void> => {
        if (cancelled) return;
        try {
          await fetchSse(streamUrl, {
            signal: controller?.signal,
            onEvent: ({ event, data }) => {
              if (cancelled) return;

              // Backend contract: event: status => JoinRequestStatusResponse
              if (event === "status") {
                const status = safeJsonParse<JoinRequestStatusResponse>(data);
                if (!status) return;

                if (status.status === "pending") {
                  setRequestStatus("pending");
                } else if (status.status === "denied") {
                  setRequestStatus("denied");
                } else {
                  handleAdmitted(status);
                }

                return;
              }

              // Backward-compatible wrapper (older frontend expectation)
              const wrapped = safeJsonParse<JoinRequestStreamEvent>(data);
              if (!wrapped) return;

              if (wrapped.type === "ended") {
                setIsEnded(true);
              } else if (wrapped.type === "status") {
                const payload = wrapped.data;
                if (payload.status === "pending") setRequestStatus("pending");
                else if (payload.status === "denied") setRequestStatus("denied");
                else handleAdmitted(payload);
              }
            },
          });

          // Stream ended (backend may close on admitted/denied). If still pending, reconnect.
          if (!cancelled && requestStatus === "pending") {
            scheduleStream(computeDelay(), () => void run());
            reconnectDelayMs = Math.min(
              Math.floor(reconnectDelayMs * 1.5),
              maxReconnectDelayMs
            );
          }
        } catch (err) {
          if (cancelled) return;
          if (err instanceof DOMException && err.name === "AbortError") return;

          if (err instanceof SseHttpError) {
            // No polling fallback requested. Surface a clear error.
            if (err.status === 404 || err.status === 405 || err.status === 501) {
              setLoadError(
                "Live updates unavailable. The server does not support streaming for this request."
              );
              return;
            }
          }

          // Transient failure: reconnect rather than switching to polling.
          scheduleStream(computeDelay(), () => void run());
          reconnectDelayMs = Math.min(
            Math.floor(reconnectDelayMs * 1.6),
            maxReconnectDelayMs
          );
        }
      };

      void run();
    };

    const handleVisibilityChange = () => {
      if (cancelled) return;
      if (requestStatus !== "pending") return;
      if (typeof document === "undefined") return;
      if (!document.hidden) {
        if (timeoutId) window.clearTimeout(timeoutId);
        void startStream();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    void startStream();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      controller?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    displayName,
    isHostCandidate,
    requestId,
    requestStatus,
    router,
    sessionId,
  ]);

  const handleJoin = async (role: "participant" | "observer", name?: string) => {
    if (!sessionId) return;
    setIsJoining(true);
    try {
      if (name) setDisplayName(name);

      if (typeof window !== "undefined") {
        // A new join attempt satisfies the "must re-request" rule.
        sessionStorage.removeItem(`decisra:mustReRequest:${sessionId}`);
      }

      if (isHostCandidate) {
        if (!hostToken) throw new Error("Missing host token");

        const { data } = await apiFetchJson<JoinRoomResponse>(
          `/api/session/${encodeURIComponent(sessionId)}/join`,
          { method: "POST", hostToken, body: {} }
        );

        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `decisra:join:${sessionId}`,
            JSON.stringify({
              assignedRole: data.role,
              roomUrl: data.roomUrl,
              dailyToken: data.dailyToken,
            })
          );
          if (name) {
            sessionStorage.setItem(`decisra:displayName:${sessionId}`, name);
          }
        }

        router.push(`/session/${sessionId}/live`);
        return;
      }

      // Participant/observer: create a join request (do NOT call /join).
      setRequestedRole(role);

      const { data } = await apiFetchJson<CreateJoinRequestResponse>(
        `/api/session/${encodeURIComponent(sessionId)}/join-request`,
        { method: "POST", body: { role } }
      );

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `decisra:joinRequest:${sessionId}`,
          JSON.stringify({ requestId: data.requestId, requestedRole: role })
        );
        if (name) {
          sessionStorage.setItem(`decisra:displayName:${sessionId}`, name);
        }
      }

      setRequestId(data.requestId);
      setRequestStatus("pending");
      router.replace(`/session/${sessionId}?requestId=${encodeURIComponent(data.requestId)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join session";
      setLoadError(message);
    } finally {
      setIsJoining(false);
    }
  };

  const clearJoinRequest = () => {
    if (!sessionId) return;
    setRequestId(null);
    setRequestedRole(null);
    setRequestStatus("idle");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
    }
    router.replace(`/session/${sessionId}`);
  };

  if (forcedVariant) {
    return (
      <SessionEnded
        onStartNew={() => router.push("/session/new")}
        variant={forcedVariant}
      />
    );
  }

  if (isEnded) {
    return <SessionEnded onStartNew={() => router.push("/session/new")} variant="ended" />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <p className="text-muted-foreground">
            {loadError ? <>{loadError}</> : "Loading session..."}
          </p>

          {loadError ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button type="button" variant={"hero"} onClick={() => router.push("/session/new")}>
                Start a New Session
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
              >
                Go to Home
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!isHostCandidate && requestId && requestStatus === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-xl font-semibold text-foreground">
            Waiting for host approval…
          </h1>
          <p className="text-sm text-muted-foreground">
            Your request is pending. Keep this tab open — you&apos;ll join automatically
            once admitted.
          </p>
          {requestedRole && (
            <p className="text-xs text-muted-foreground">
              Requested role: {requestedRole}
            </p>
          )}
          {loadError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {loadError}
            </div>
          )}
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground underline"
            onClick={clearJoinRequest}
          >
            Cancel request
          </button>
        </div>
      </div>
    );
  }

  if (!isHostCandidate && requestId && requestStatus === "denied") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            The host denied your request. You can try again.
          </p>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground underline"
            onClick={clearJoinRequest}
          >
            Request again
          </button>
        </div>
      </div>
    );
  }

  return (
    <JoinPreview
      session={session}
      notice={notice}
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
