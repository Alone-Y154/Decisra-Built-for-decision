import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ApiHttpError, apiFetchJson } from "@/lib/api";

export type VerdictAiRole = "host" | "participant";

type PreflightResponse = {
  wsPath: string;
  aiToken?: string;
  expiresAt?: number;
  aiUsageCount?: number;
  aiUsageLimit?: number;
  remaining?: number;
  [key: string]: unknown;
};

type ConnectionStatus =
  | "idle"
  | "preflighting"
  | "connecting"
  | "connected"
  | "disabled"
  | "error";

export type VerdictAiMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  kind?: "scope_violation" | "error";
};

type AiDebug = {
  sentCount: number;
  receivedCount: number;
  lastSentType: string | null;
  lastReceivedType: string | null;
  lastSendError: string | null;
};

type UseVerdictAiArgs = {
  sessionId: string;
  role: VerdictAiRole;
  hostToken?: string | null;
  requestId?: string | null;
  autoConnect?: boolean;
};

type WsCloseInfo = {
  code: number;
  reason: string;
  wasClean: boolean;
} | null;

type PersistedAiState = {
  remaining: number | null;
  aiUsageCount: number | null;
  aiUsageLimit: number | null;
  disabledReason: string | null;
  updatedAt: number;
};

const aiStateStorageKey = (sessionId: string) => `decisra:aiState:${sessionId}`;

const safeParseJson = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const toWebSocketUrl = (wsPath: string) => {
  if (wsPath.startsWith("ws://") || wsPath.startsWith("wss://")) return wsPath;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (apiBase) {
    const base = new URL(apiBase);
    const wsProto = base.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${base.host}${wsPath.startsWith("/") ? wsPath : `/${wsPath}`}`;
  }

  if (typeof window === "undefined") {
    // Should only be called client-side.
    return wsPath;
  }

  const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProto}//${window.location.host}${wsPath.startsWith("/") ? wsPath : `/${wsPath}`}`;
};

const appendQueryParam = (url: string, key: string, value: string) => {
  const u = new URL(url);
  u.searchParams.set(key, value);
  return u.toString();
};

const newId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const pickDeltaText = (evt: Record<string, unknown>) => {
  const delta = evt.delta;
  if (typeof delta === "string") return delta;

  const text = evt.text;
  if (typeof text === "string") return text;

  const chunk = evt.chunk;
  if (typeof chunk === "string") return chunk;

  return null;
};

const pickDoneText = (evt: Record<string, unknown>) => {
  const text = evt.text;
  if (typeof text === "string") return text;

  const outputText = evt.output_text;
  if (typeof outputText === "string") return outputText;

  return null;
};

const extractTextFromResponseDone = (evt: Record<string, unknown>) => {
  // Expected-ish shapes:
  // { type: "response.done", response: { output: [{ content: [{ type:"output_text"|"text", text:"..." }]}] } }
  const response = evt.response;
  if (!response || typeof response !== "object") return null;
  const output = (response as Record<string, unknown>).output;
  if (!Array.isArray(output)) return null;

  let text = "";
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const p = part as Record<string, unknown>;
      if ((p.type === "output_text" || p.type === "text") && typeof p.text === "string") {
        text += p.text;
      }
    }
  }

  return text.trim() ? text : null;
};

export function useVerdictAiRealtime({
  sessionId,
  role,
  hostToken = null,
  requestId = null,
  autoConnect = true,
}: UseVerdictAiArgs) {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [aiToken, setAiToken] = useState<string | null>(null);
  const [aiExpiresAt, setAiExpiresAt] = useState<number | null>(null);
  const [aiUsageCount, setAiUsageCount] = useState<number | null>(null);
  const [aiUsageLimit, setAiUsageLimit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [lastWsClose, setLastWsClose] = useState<WsCloseInfo>(null);
  const [debug, setDebug] = useState<AiDebug>({
    sentCount: 0,
    receivedCount: 0,
    lastSentType: null,
    lastReceivedType: null,
    lastSendError: null,
  });

  const [messages, setMessages] = useState<VerdictAiMessage[]>([]);

  const persistRef = useRef<PersistedAiState | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isManuallyClosedRef = useRef(false);

  const streamingAssistantIdRef = useRef<string | null>(null);
  const warnedAboutAudioRef = useRef(false);

  // We only update quota counters after we know a request was actually processed.
  // If the backend responds with `scope.violation`, the request should not consume quota.
  const pendingChargeCountRef = useRef(0);
  const chargedThisResponseRef = useRef(false);

  const canSend = status === "connected";

  // Hydrate persisted quota/limit state so refresh shows the latest values
  // and a previously reached limit remains visible.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionId) return;

    const stored = safeParseJson<PersistedAiState>(
      sessionStorage.getItem(aiStateStorageKey(sessionId))
    );
    if (!stored) return;

    persistRef.current = stored;

    if (typeof stored.remaining === "number") setRemaining(stored.remaining);
    if (typeof stored.aiUsageCount === "number") setAiUsageCount(stored.aiUsageCount);
    if (typeof stored.aiUsageLimit === "number") setAiUsageLimit(stored.aiUsageLimit);

    if (stored.disabledReason) {
      setStatus("disabled");
      setError(stored.disabledReason);
    }
  }, [sessionId]);

  const persistState = useCallback(
    (patch: Partial<PersistedAiState>) => {
      if (typeof window === "undefined") return;
      if (!sessionId) return;

      const prev =
        persistRef.current ??
        safeParseJson<PersistedAiState>(
          sessionStorage.getItem(aiStateStorageKey(sessionId))
        ) ?? {
          remaining: null,
          aiUsageCount: null,
          aiUsageLimit: null,
          disabledReason: null,
          updatedAt: Date.now(),
        };

      const next: PersistedAiState = {
        remaining:
          patch.remaining !== undefined ? patch.remaining : prev.remaining,
        aiUsageCount:
          patch.aiUsageCount !== undefined ? patch.aiUsageCount : prev.aiUsageCount,
        aiUsageLimit:
          patch.aiUsageLimit !== undefined ? patch.aiUsageLimit : prev.aiUsageLimit,
        disabledReason:
          patch.disabledReason !== undefined
            ? patch.disabledReason
            : prev.disabledReason,
        updatedAt: Date.now(),
      };

      persistRef.current = next;
      sessionStorage.setItem(aiStateStorageKey(sessionId), JSON.stringify(next));
    },
    [sessionId]
  );

  const applyCharge = useCallback(() => {
    setRemaining((prev) => {
      if (typeof prev !== "number") return prev;
      const next = Math.max(0, prev - 1);
      persistState({ remaining: next });
      return next;
    });
    setAiUsageCount((prev) => {
      if (typeof prev !== "number") return prev;
      const next = prev + 1;
      persistState({ aiUsageCount: next });
      return next;
    });
  }, [persistState]);

  const maybeChargeForAssistantOutput = useCallback(() => {
    if (chargedThisResponseRef.current) return;
    if (pendingChargeCountRef.current <= 0) return;

    pendingChargeCountRef.current -= 1;
    chargedThisResponseRef.current = true;
    applyCharge();
  }, [applyCharge]);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const closeSocket = useCallback(() => {
    clearReconnectTimer();

    const ws = wsRef.current;
    wsRef.current = null;

    if (ws) {
      try {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      } catch {
        // ignore
      }
    }

    streamingAssistantIdRef.current = null;
    warnedAboutAudioRef.current = false;
  }, []);

  const disable = useCallback(
    (message: string) => {
      setStatus("disabled");
      setError(message);
      persistState({ disabledReason: message });
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "system", content: message, kind: "error" },
      ]);
      isManuallyClosedRef.current = true;
      closeSocket();
    },
    [closeSocket, persistState]
  );

  const connect = useCallback(async (options?: { resetAttempts?: boolean }) => {
    if (!sessionId) return;

    isManuallyClosedRef.current = false;
    setError(null);
    setLastWsClose(null);
    if (options?.resetAttempts) reconnectAttemptRef.current = 0;

    closeSocket();

    try {
      setStatus("preflighting");

      const endpoint = `/api/session/${encodeURIComponent(sessionId)}/ai/connect`;
      const body =
        role === "host"
          ? { role: "host" as const }
          : { role: "participant" as const, requestId };

      if (role === "host" && !hostToken) {
        throw new Error("Missing host token for AI connect");
      }

      if (role === "participant" && !requestId) {
        throw new Error("Missing requestId for AI connect");
      }

      const { data } = await apiFetchJson<PreflightResponse>(endpoint, {
        method: "POST",
        body,
        hostToken: role === "host" ? hostToken : null,
      });

      if (!data || typeof data.wsPath !== "string") {
        throw new Error("AI connect: invalid response");
      }

      const aiTokenFromRes = typeof data.aiToken === "string" ? data.aiToken : null;

      setAiToken(aiTokenFromRes);
      setAiExpiresAt(typeof data.expiresAt === "number" ? data.expiresAt : null);
      const nextUsageCount = typeof data.aiUsageCount === "number" ? data.aiUsageCount : null;
      const nextUsageLimit = typeof data.aiUsageLimit === "number" ? data.aiUsageLimit : null;
      setAiUsageCount(nextUsageCount);
      setAiUsageLimit(nextUsageLimit);
      persistState({ aiUsageCount: nextUsageCount, aiUsageLimit: nextUsageLimit });

      if (typeof data.remaining === "number") {
        setRemaining(data.remaining);
        persistState({ remaining: data.remaining, disabledReason: null });
        if (data.remaining <= 0) {
          disable("AI limit reached for this session.");
          return;
        }
      }

      setStatus("connecting");

      const baseUrl = toWebSocketUrl(data.wsPath);
      let wsUrl = appendQueryParam(baseUrl, "role", role);

      // Browser WebSockets can't send custom headers (like Authorization), so
      // the backend typically requires the aiToken via query params.
      if (aiTokenFromRes) {
        wsUrl = appendQueryParam(wsUrl, "aiToken", aiTokenFromRes);
        // Compatibility: some backends expect `token` instead.
        wsUrl = appendQueryParam(wsUrl, "token", aiTokenFromRes);
      }
      setWsUrl(wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        setError(null);
        reconnectAttemptRef.current = 0;
      };

      ws.onmessage = (msg) => {
        const raw = typeof msg.data === "string" ? msg.data : null;
        if (!raw) return;

        let evt: unknown = null;
        try {
          evt = JSON.parse(raw);
        } catch {
          return;
        }

        if (!evt || typeof evt !== "object") return;
        const rec = evt as Record<string, unknown>;
        const type = rec.type;

        // If the backend includes live quota counters in any event, keep UI in sync.
        if (typeof rec.remaining === "number") {
          setRemaining(rec.remaining);
          persistState({ remaining: rec.remaining });
        }
        if (typeof rec.aiUsageCount === "number") {
          setAiUsageCount(rec.aiUsageCount);
          persistState({ aiUsageCount: rec.aiUsageCount });
        }
        if (typeof rec.aiUsageLimit === "number") {
          setAiUsageLimit(rec.aiUsageLimit);
          persistState({ aiUsageLimit: rec.aiUsageLimit });
        }

        setDebug((prev) => ({
          ...prev,
          receivedCount: prev.receivedCount + 1,
          lastReceivedType: typeof type === "string" ? type : prev.lastReceivedType,
        }));

        if (type === "scope.violation") {
          // Do not consume quota for out-of-scope prompts.
          if (pendingChargeCountRef.current > 0) {
            pendingChargeCountRef.current -= 1;
          }
          chargedThisResponseRef.current = false;

          const detail = typeof rec.message === "string" ? rec.message : null;
          setMessages((prev) => [
            ...prev,
            {
              id: newId(),
              role: "system",
              kind: "scope_violation",
              content: detail
                ? `Out of scope: ${detail}`
                : "Out of scope. Try rephrasing within the session scope.",
            },
          ]);
          return;
        }

        if (type === "limit.reached") {
          disable("AI limit reached for this session.");
          return;
        }

        if (type === "error") {
          const message =
            typeof rec.message === "string"
              ? rec.message
              : "AI encountered an error. AI has been disabled.";
          disable(message);
          return;
        }

        // Best-effort: stitch assistant output from common Realtime delta events.
        const typeStr = typeof type === "string" ? type : "";

        // If the backend is emitting audio output events, the UI will appear to
        // "not respond" because we only render text. Surface this clearly.
        if (!warnedAboutAudioRef.current && typeStr.includes("audio")) {
          warnedAboutAudioRef.current = true;
          setMessages((prev) => [
            ...prev,
            {
              id: newId(),
              role: "system",
              kind: "error",
              content:
                "AI returned audio output events. This UI only supports text responses. Ensure the backend requests/returns text (e.g. output_text).",
            },
          ]);
        }
        const isDelta = typeStr.endsWith(".delta");

        // Some servers send the complete output text on *.done.
        const isOutputTextDone =
          typeStr === "response.output_text.done" ||
          (typeStr.endsWith(".done") && typeStr.includes("output_text"));

        if (isDelta) {
          const deltaText = pickDeltaText(rec);
          if (!deltaText) return;

          // If we are receiving assistant text, this request should consume quota.
          maybeChargeForAssistantOutput();

          setMessages((prev) => {
            const streamingId = streamingAssistantIdRef.current;
            if (!streamingId) {
              const id = newId();
              streamingAssistantIdRef.current = id;
              return [...prev, { id, role: "assistant", content: deltaText }];
            }

            const next = prev.map((m) =>
              m.id === streamingId
                ? { ...m, content: m.content + deltaText }
                : m
            );
            return next;
          });

          return;
        }

        if (isOutputTextDone) {
          const doneText = pickDoneText(rec);
          if (!doneText) return;

          maybeChargeForAssistantOutput();

          setMessages((prev) => {
            const id = newId();
            return [...prev, { id, role: "assistant", content: doneText }];
          });

          streamingAssistantIdRef.current = null;
          chargedThisResponseRef.current = false;
          return;
        }

        if (typeStr === "response.done") {
          const done = extractTextFromResponseDone(rec);
          if (done) {
            maybeChargeForAssistantOutput();
            setMessages((prev) => [...prev, { id: newId(), role: "assistant", content: done }]);
          }
          streamingAssistantIdRef.current = null;
          chargedThisResponseRef.current = false;
          return;
        }

        if (typeStr.endsWith(".done") || typeStr === "response.done") {
          streamingAssistantIdRef.current = null;
          chargedThisResponseRef.current = false;
        }
      };

      ws.onerror = () => {
        // Let onclose handle reconnect/backoff.
      };

      ws.onclose = (evt) => {
        wsRef.current = null;
        streamingAssistantIdRef.current = null;
        chargedThisResponseRef.current = false;

        setLastWsClose({ code: evt.code, reason: evt.reason, wasClean: evt.wasClean });

        if (isManuallyClosedRef.current) return;
        if (status === "disabled") return;

        const attempt = reconnectAttemptRef.current + 1;
        reconnectAttemptRef.current = attempt;

        if (attempt > 5) {
          setStatus("error");
          setError(
            `AI connection lost (code ${evt.code}). Click Reconnect to try again.`
          );
          return;
        }

        const baseDelay = Math.min(8000, 750 * Math.pow(1.6, attempt - 1));
        const hidden = typeof document !== "undefined" && document.hidden;
        const delay = hidden ? 15000 : baseDelay;

        setStatus("connecting");
        clearReconnectTimer();
        reconnectTimerRef.current = window.setTimeout(() => {
          void connect();
        }, delay);
      };
    } catch (err) {
      // Backend signals AI limits via remaining<=0 or WS `limit.reached`, but
      // it may also return HTTP 429 from /ai/connect.
      if (err instanceof ApiHttpError && err.status === 429) {
        disable("AI limit reached for this session.");
        return;
      }

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to connect AI");
      }
      setStatus("error");
    }
  }, [closeSocket, disable, hostToken, persistState, requestId, role, sessionId, status]);

  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;
    closeSocket();
    setStatus("idle");
  }, [closeSocket]);

  const sendEvent = useCallback((event: Record<string, unknown>) => {
    if (event.type === "session.update") {
      throw new Error("Client must not send session.update");
    }

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error("AI is not connected");
    }

    try {
      ws.send(JSON.stringify(event));
      setDebug((prev) => ({
        ...prev,
        sentCount: prev.sentCount + 1,
        lastSentType: typeof event.type === "string" ? event.type : prev.lastSentType,
        lastSendError: null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send WS message";
      setDebug((prev) => ({ ...prev, lastSendError: message }));
      throw err;
    }
  }, []);

  const sendUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "user", content: trimmed },
      ]);

      if (status !== "connected") {
        throw new Error("AI is not connected");
      }

      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: trimmed }],
        },
      });

      // Be explicit: some backends won't generate without a modality.
      sendEvent({
        type: "response.create",
        response: {
          modalities: ["text"],
        },
      });

      // Track a pending request. We'll only decrement remaining/increment usage
      // when we actually receive assistant output for this response.
      pendingChargeCountRef.current += 1;
      chargedThisResponseRef.current = false;
    },
    [sendEvent, status]
  );

  useEffect(() => {
    if (!autoConnect) return;
    if (!sessionId) return;
    if (status !== "idle") return;

    void connect();

    return () => {
      isManuallyClosedRef.current = true;
      closeSocket();
    };
  }, [autoConnect, closeSocket, connect, sessionId, status]);

  const controls = useMemo(
    () => ({ connect, disconnect, sendUserMessage, sendEvent }),
    [connect, disconnect, sendEvent, sendUserMessage]
  );

  return {
    status,
    remaining,
    aiToken,
    aiExpiresAt,
    aiUsageCount,
    aiUsageLimit,
    error,
    wsUrl,
    lastWsClose,
    debug,
    messages,
    canSend,
    ...controls,
  };
}
