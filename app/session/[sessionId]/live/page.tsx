"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";

import { SessionHeader } from "@/components/session/SessionHeader";
import { AudioControls } from "@/components/session/AudioControls";
import { ParticipantsPanel } from "@/components/session/ParticipantsPanel";
import { AIPanel } from "@/components/session/AIPanel";
import { SessionSharePanel } from "@/components/session/SessionSharePanel";
import { EndSessionModal } from "@/components/session/EndSessionModal";
import { LeaveCallModal } from "@/components/session/LeaveCallModal";
import { SessionEnded } from "@/components/session/SessionEnded";

import type { Session } from "@/lib/types/session";
import { ApiHttpError, apiFetchJson, apiUrl } from "@/lib/api";
import { fetchSse, safeJsonParse, SseHttpError } from "@/lib/sse";

type JoinStorage = {
  assignedRole?: "host" | "participant" | "observer";
  roomUrl?: string;
  dailyToken?: string;
};

type JoinRequestsResponse = {
  requests: Array<{
    requestId: string;
    requestedRole: "participant" | "observer";
    createdAt: number;
  }>;
};

type JoinRequestsStreamEvent =
  | { type: "snapshot"; data: JoinRequestsResponse }
  | { type: "keepalive" }
  | { type: "ended" };

type JoinRequestsEventPayload = {
  sessionId: string;
  requests: JoinRequestsResponse["requests"];
};

type UiParticipant = {
  id: string;
  name: string;
  role: "host" | "participant" | "observer";
};

type AudioDeviceOption = { deviceId: string; label: string };

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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [dailyToken, setDailyToken] = useState<string | null>(null);

  const [isEnded, setIsEnded] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [joinAttempt, setJoinAttempt] = useState(0);



  const [participants, setParticipants] = useState<UiParticipant[]>([]);

  const [outputDevices, setOutputDevices] = useState<AudioDeviceOption[]>([]);
  const [selectedOutputDeviceId, setSelectedOutputDeviceId] = useState<string>(
    "default"
  );
  const [audioDiagError, setAudioDiagError] = useState<string | null>(null);
  const [speakerTestStatus, setSpeakerTestStatus] = useState<
    "idle" | "playing" | "done" | "error"
  >("idle");
  const [remoteAudioLevels, setRemoteAudioLevels] = useState<Record<string, number>>(
    {}
  );
  const [remoteAudioTrackCount, setRemoteAudioTrackCount] = useState(0);

  const callRef = useRef<DailyCall | null>(null);
  const joinInFlightRef = useRef(false);

  const remoteAudioContainerRef = useRef<HTMLDivElement | null>(null);
  const remoteAudioElsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const [pendingRequests, setPendingRequests] = useState<
    JoinRequestsResponse["requests"]
  >([]);
  const [isRefreshingRequests, setIsRefreshingRequests] = useState(false);

  const participantNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of participants) map.set(p.id, p.name);
    return map;
  }, [participants]);

  const refreshOutputDevices = async () => {
    if (typeof navigator === "undefined") return;
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outsRaw = devices
        .filter((d) => d.kind === "audiooutput")
        .map((d, idx) => ({
          // Some browsers may return empty ids until permissions are granted.
          // Also, multiple entries can report "default"; we handle that below.
          deviceId: d.deviceId || `audiooutput-${idx}`,
          label: d.label || `Speaker ${idx + 1}`,
        }))
        .filter((d) => d.deviceId !== "default");

      const uniqueById = new Map<string, AudioDeviceOption>();
      for (const d of outsRaw) uniqueById.set(d.deviceId, d);

      setOutputDevices([
        { deviceId: "default", label: "System default" },
        ...Array.from(uniqueById.values()),
      ]);
    } catch {
      // ignore
    }
  };

  const handleTestSpeaker = async () => {
    setAudioDiagError(null);
    setSpeakerTestStatus("playing");

    try {
      const AudioContextCtor =
        window.AudioContext ||
        (
          window as unknown as {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextCtor) throw new Error("WebAudio not supported");

      const ctx = new AudioContextCtor();
      if (ctx.state === "suspended") await ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.04;
      osc.frequency.value = 440;

      const dest = ctx.createMediaStreamDestination();
      osc.connect(gain);
      gain.connect(dest);

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.srcObject = dest.stream;

      const maybe = audio as HTMLAudioElement & {
        setSinkId?: (id: string) => Promise<void>;
      };

      if (
        selectedOutputDeviceId &&
        selectedOutputDeviceId !== "default" &&
        typeof maybe.setSinkId === "function"
      ) {
        await maybe.setSinkId(selectedOutputDeviceId);
      }

      await audio.play();
      osc.start();

      await new Promise((r) => setTimeout(r, 350));

      osc.stop();
      audio.pause();
      audio.srcObject = null;
      await ctx.close();

      setSpeakerTestStatus("done");
      window.setTimeout(() => setSpeakerTestStatus("idle"), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Speaker test failed";
      setAudioDiagError(msg);
      setSpeakerTestStatus("error");
      window.setTimeout(() => setSpeakerTestStatus("idle"), 1500);
    }
  };

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

      const roleFromJoin = join.assignedRole;
      const effectiveRole: "host" | "participant" | "observer" =
        roleFromJoin === "host"
          ? "host"
          : roleFromJoin === "observer"
            ? "observer"
            : "participant";

      setUserRole(effectiveRole);
      setIsMuted(effectiveRole === "observer");

      if (typeof join.roomUrl === "string" && typeof join.dailyToken === "string") {
        setRoomUrl(join.roomUrl);
        setDailyToken(join.dailyToken);
      } else {
        setLoadError("Missing call credentials. Please request access again.");
        router.replace(`/session/${sessionId}`);
      }
    } catch {
      router.replace(`/session/${sessionId}`);
    }
  }, [hostToken, router, sessionId]);

  const isHost = userRole === "host";
  const canEndSession = isHost && !!hostToken;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionId) return;
    const saved = sessionStorage.getItem(`decisra:outputDeviceId:${sessionId}`);
    if (saved) setSelectedOutputDeviceId(saved);
  }, [sessionId]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEnded) return;
    void refreshOutputDevices();
  }, [isConnected, isEnded]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEnded) return;

    const callObject = callRef.current;
    if (!callObject) return;

    let intervalId: number | null = null;
    let cancelled = false;

    (async () => {
      try {
        await callObject.startRemoteParticipantsAudioLevelObserver(200);
      } catch {
        // ignore
      }

      intervalId = window.setInterval(() => {
        if (cancelled) return;
        try {
          setRemoteAudioLevels(
            callObject.getRemoteParticipantsAudioLevel() as Record<string, number>
          );
        } catch {
          // ignore
        }
      }, 300);
    })();

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      try {
        callObject.stopRemoteParticipantsAudioLevelObserver();
      } catch {
        // ignore
      }
    };
  }, [isConnected, isEnded]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isConnected) return;
    if (isEnded) return;

    const callObject = callRef.current;
    if (!callObject) return;

    const ensureAudioEl = async (sessionIdForAudio: string) => {
      const existing = remoteAudioElsRef.current.get(sessionIdForAudio);
      if (existing) return existing;

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.setAttribute("playsinline", "true");
      audio.muted = false;
      audio.volume = 1;

      remoteAudioElsRef.current.set(sessionIdForAudio, audio);
      setRemoteAudioTrackCount(remoteAudioElsRef.current.size);

      remoteAudioContainerRef.current?.appendChild(audio);

      const maybe = audio as HTMLAudioElement & {
        setSinkId?: (id: string) => Promise<void>;
      };

      if (selectedOutputDeviceId && typeof maybe.setSinkId === "function") {
        try {
          await maybe.setSinkId(selectedOutputDeviceId);
        } catch {
          // ignore
        }
      }

      return audio;
    };

    const cleanupAudioEl = (sessionIdForAudio: string) => {
      const audio = remoteAudioElsRef.current.get(sessionIdForAudio);
      if (!audio) return;
      try {
        audio.pause();
      } catch {
        // ignore
      }
      audio.srcObject = null;
      try {
        audio.remove();
      } catch {
        // ignore
      }
      remoteAudioElsRef.current.delete(sessionIdForAudio);
      setRemoteAudioTrackCount(remoteAudioElsRef.current.size);
    };

    const onTrackStarted = (evt: unknown) => {
      const record = evt as {
        participant?: { local?: boolean; session_id?: string };
        track?: MediaStreamTrack;
      };

      const participant = record.participant;
      const track = record.track;
      if (!participant || participant.local) return;
      if (!track || track.kind !== "audio") return;

      const remoteSessionId = participant.session_id;
      if (!remoteSessionId) return;

      void (async () => {
        const audioEl = await ensureAudioEl(remoteSessionId);

        try {
          audioEl.srcObject = new MediaStream([track]);
        } catch {
          return;
        }

        try {
          await audioEl.play();
        } catch (err) {
          const msg =
            err instanceof Error
              ? err.message
              : "Audio playback blocked (try clicking Reconnect audio)";
          setAudioDiagError(msg);
        }
      })();
    };

    const onTrackStopped = (evt: unknown) => {
      const record = evt as {
        participant?: { local?: boolean; session_id?: string };
        track?: MediaStreamTrack;
      };

      const participant = record.participant;
      const track = record.track;
      if (!participant || participant.local) return;
      if (!track || track.kind !== "audio") return;

      const remoteSessionId = participant.session_id;
      if (!remoteSessionId) return;
      cleanupAudioEl(remoteSessionId);
    };

    const onParticipantLeft = (evt: unknown) => {
      const record = evt as { participant?: { session_id?: string; local?: boolean } };
      const participant = record.participant;
      if (!participant || participant.local) return;
      const remoteSessionId = participant.session_id;
      if (!remoteSessionId) return;
      cleanupAudioEl(remoteSessionId);
    };

    callObject.on("track-started", onTrackStarted as never);
    callObject.on("track-stopped", onTrackStopped as never);
    callObject.on("participant-left", onParticipantLeft as never);

    return () => {
      callObject.off("track-started", onTrackStarted as never);
      callObject.off("track-stopped", onTrackStopped as never);
      callObject.off("participant-left", onParticipantLeft as never);

      for (const id of Array.from(remoteAudioElsRef.current.keys())) {
        cleanupAudioEl(id);
      }
    };
  }, [isConnected, isEnded, selectedOutputDeviceId]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEnded) return;
    if (!selectedOutputDeviceId) return;

    for (const audio of remoteAudioElsRef.current.values()) {
      const maybe = audio as HTMLAudioElement & {
        setSinkId?: (id: string) => Promise<void>;
      };
      if (typeof maybe.setSinkId !== "function") continue;
      void Promise.resolve(maybe.setSinkId(selectedOutputDeviceId)).catch(() => {
        // ignore
      });
    }
  }, [isConnected, isEnded, selectedOutputDeviceId]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEnded) return;

    const callObject = callRef.current;
    if (!callObject) return;
    if (!selectedOutputDeviceId) return;

    setAudioDiagError(null);
    void Promise.resolve(
      callObject.setOutputDeviceAsync({ outputDeviceId: selectedOutputDeviceId })
    )
      .then(() => {
        if (typeof window !== "undefined" && sessionId) {
          sessionStorage.setItem(
            `decisra:outputDeviceId:${sessionId}`,
            selectedOutputDeviceId
          );
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to set output device";
        setAudioDiagError(msg);
      });
  }, [isConnected, isEnded, selectedOutputDeviceId, sessionId]);

  useEffect(() => {
    if (!roomUrl || !dailyToken) return;
    if (isEnded) return;

    let cancelled = false;
    let callObject: DailyCall | null = null;

    const join = async () => {
      if (joinInFlightRef.current) return;
      if (callRef.current) return;

      joinInFlightRef.current = true;
      setIsConnected(false);
      setLoadError(null);

      try {
        callObject = DailyIframe.createCallObject();
        callRef.current = callObject;

        await callObject.join({ url: roomUrl, token: dailyToken });

        if (cancelled) return;
        setIsConnected(true);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "string"
              ? err
              : "Failed to join call";
        // Help debugging in devtools without leaking tokens into UI.
        console.error("Daily join failed", { roomUrl }, err);
        setLoadError(message);
        setIsConnected(false);

        // Important: if join fails, clean up the call object so a retry can work.
        const current = callRef.current;
        if (current && current === callObject) {
          callRef.current = null;
          try {
            current.destroy();
          } catch {
            // ignore
          }
        }
      } finally {
        joinInFlightRef.current = false;
      }
    };

    join();

    return () => {
      cancelled = true;

      // StrictMode/dev can mount/unmount effects twice; ensure we destroy the call object
      // created for this render pass.
      const current = callRef.current;
      if (current && current === callObject) {
        callRef.current = null;
        void Promise.resolve(current.leave()).catch(() => {
          // ignore
        });
        try {
          current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [dailyToken, isEnded, joinAttempt, roomUrl]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEnded) return;

    const callObject = callRef.current;
    if (!callObject) return;

    const mapParticipants = () => {
      const snapshot = callObject.participants();
      const list: UiParticipant[] = Object.entries(snapshot).map(([id, p]) => {
        const record = p as unknown as {
          user_name?: unknown;
          local?: unknown;
          owner?: unknown;
        };

        const isLocal = record.local === true;
        const isOwner = record.owner === true;
        const nameFromDaily =
          typeof record.user_name === "string" && record.user_name.trim()
            ? record.user_name
            : isLocal
              ? displayName || "You"
              : "Guest";

        const role: UiParticipant["role"] = isLocal
          ? userRole
          : isOwner
            ? "host"
            : "participant";

        return { id, name: nameFromDaily, role };
      });

      // Put local participant first for a nicer UX.
      list.sort((a, b) => (a.id === "local" ? -1 : b.id === "local" ? 1 : 0));
      setParticipants(list);
    };

    // Set our displayed name in Daily if possible.
    if (displayName && displayName.trim()) {
      try {
        // daily-js supports setUserName; it may be sync or async depending on version.
        void Promise.resolve(
          (callObject as unknown as { setUserName?: (name: string) => unknown }).setUserName?.(
            displayName
          )
        );
      } catch {
        // ignore
      }
    }

    mapParticipants();

    const onChange = () => mapParticipants();
    callObject.on("participant-joined", onChange);
    callObject.on("participant-updated", onChange);
    callObject.on("participant-left", onChange);

    return () => {
      callObject.off("participant-joined", onChange);
      callObject.off("participant-updated", onChange);
      callObject.off("participant-left", onChange);
    };
  }, [displayName, isConnected, isEnded, userRole]);

  useEffect(() => {
    const callObject = callRef.current;
    if (!callObject) return;
    if (!isConnected) return;
    if (isEnded) return;

    // Observers start muted (backend configured), and we also enforce locally.
    const shouldEnableAudio = !(userRole === "observer" || isMuted);
    void Promise.resolve(callObject.setLocalAudio(shouldEnableAudio)).catch(() => {
      // ignore
    });
  }, [isConnected, isEnded, isMuted, userRole]);

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
          const maybeRecord = data as { error?: unknown };
          const message =
            typeof maybeRecord?.error === "string"
              ? maybeRecord.error
              : `Failed to load session (${res.status})`;
          throw new ApiHttpError(res.status, message, data);
        }

        const normalized = normalizeSession(data);
        if (!normalized) throw new Error("Invalid session payload");

        if (!cancelled) setSession(normalized);
      } catch (err) {
        if (err instanceof ApiHttpError) {
          if (!cancelled && err.status === 410) {
            setIsEnded(true);
            setIsConnected(false);
            return;
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
  }, [apiBaseUrl, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (!isHost) return;
    if (!hostToken) return;
    if (isEnded) return;

    let cancelled = false;
    let timeoutId: number | null = null;
    let controller: AbortController | null = null;

    const scheduleStream = (ms: number, fn: () => void) => {
      if (cancelled) return;
      const jitter = Math.floor(Math.random() * 250);
      timeoutId = window.setTimeout(fn, ms + jitter);
    };

    const startStream = async () => {
      const streamUrl = apiUrl(
        `/api/session/${encodeURIComponent(sessionId)}/join-requests/stream`
      );

      controller?.abort();
      controller = new AbortController();

      // Reconnect with gentle backoff if the stream drops.
      let reconnectDelayMs = 750;
      const maxReconnectDelayMs = 8000;

      const computeDelay = () => {
        if (typeof document !== "undefined" && document.hidden) return 15_000;
        return reconnectDelayMs;
      };

      const run = async (): Promise<void> => {
        if (cancelled) return;
        try {
          setIsRefreshingRequests(true);
          await fetchSse(streamUrl, {
            signal: controller?.signal,
            headers: {
              Authorization: `Bearer ${hostToken}`,
            },
            onEvent: ({ event, data }) => {
              if (cancelled) return;

              // Backend contract: event: requests => { sessionId, requests }
              if (event === "requests") {
                const payload = safeJsonParse<JoinRequestsEventPayload>(data);
                if (!payload) return;
                const requests = payload.requests ?? [];
                setPendingRequests(requests);
                setIsRefreshingRequests(false);
                return;
              }

              // Backward-compatible wrapper
              const wrapped = safeJsonParse<JoinRequestsStreamEvent>(data);
              if (!wrapped) return;

              if (wrapped.type === "ended") {
                setIsEnded(true);
              } else if (wrapped.type === "snapshot") {
                const requests = wrapped.data.requests ?? [];
                setPendingRequests(requests);
                setIsRefreshingRequests(false);
              }
            },
          });

          // Stream ended: reconnect.
          if (!cancelled && !isEnded) {
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
            if (err.status === 404 || err.status === 405 || err.status === 501) {
              setLoadError(
                "Live updates unavailable. The server does not support streaming join requests."
              );
              return;
            }
          }

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
  }, [hostToken, isEnded, isHost, sessionId]);

  const handleToggleMute = () => {
    if (userRole === "observer") return;
    setIsMuted((prev) => !prev);
  };

  const handleRetryJoin = () => {
    // Clear any stale call object and force a re-join attempt.
    const callObject = callRef.current;
    callRef.current = null;
    if (callObject) {
      try {
        callObject.destroy();
      } catch {
        // ignore
      }
    }
    setLoadError(null);
    setJoinAttempt((n) => n + 1);
  };

  const leaveCall = async () => {
    const callObject = callRef.current;
    callRef.current = null;
    if (!callObject) return;
    try {
      await callObject.leave();
    } catch {
      // ignore
    }
    try {
      await callObject.destroy();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isEnded) return;

    // If the session is ended (e.g., backend returns 410), make sure we fully
    // detach from the Daily call for participants/observers too.
    void leaveCall().finally(() => {
      if (typeof window !== "undefined" && sessionId) {
        sessionStorage.removeItem(`decisra:join:${sessionId}`);
        sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
      }
    });
  }, [isEnded, sessionId]);

  const handleReconnectAudio = async () => {
    // A user-initiated reconnect often resolves "joined but can't hear" issues
    // caused by browser autoplay policies or transient audio routing issues.
    await leaveCall();
    handleRetryJoin();
  };

  const handleLeave = () => {
    if (isHost && canEndSession) {
      setShowEndModal(true);
      return;
    }

    setShowLeaveModal(true);
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    leaveCall().finally(() => {
      if (typeof window !== "undefined" && sessionId) {
        sessionStorage.removeItem(`decisra:join:${sessionId}`);
        sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
      }
      router.push(`/session/${sessionId}`);
    });
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
        const maybeRecord = data as { error?: unknown };
        throw new Error(
          typeof maybeRecord?.error === "string"
            ? maybeRecord.error
            : "Failed to end session"
        );
      }

      await leaveCall();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`decisra:join:${sessionId}`);
        sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
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

  const handleAdmit = async (requestId: string) => {
    if (!sessionId || !hostToken) return;
    try {
      await apiFetchJson<{ ok: true }>(
        `/api/session/${encodeURIComponent(sessionId)}/join-requests/${encodeURIComponent(
          requestId
        )}/admit`,
        { method: "POST", hostToken }
      );
      setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to admit";
      setLoadError(message);
    }
  };

  const handleDeny = async (requestId: string) => {
    if (!sessionId || !hostToken) return;
    try {
      await apiFetchJson<{ ok: true }>(
        `/api/session/${encodeURIComponent(sessionId)}/join-requests/${encodeURIComponent(
          requestId
        )}/deny`,
        { method: "POST", hostToken }
      );
      setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to deny";
      setLoadError(message);
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
      <div ref={remoteAudioContainerRef} className="hidden" aria-hidden="true" />
      <SessionHeader session={session} />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {!loadError && !isConnected && roomUrl && dailyToken && !isEnded && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Connecting to audio… If you can’t hear anything, click “Reconnect audio”.
            </p>
            <button
              type="button"
              className="mt-3 text-sm underline text-foreground hover:opacity-90"
              onClick={handleReconnectAudio}
            >
              Reconnect audio
            </button>
          </div>
        )}
        {loadError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{loadError}</p>
            {!isConnected && roomUrl && dailyToken && !isEnded && (
              <button
                type="button"
                className="mt-3 text-sm underline text-destructive hover:opacity-90"
                onClick={handleRetryJoin}
              >
                Retry joining the call
              </button>
            )}
          </div>
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

            <ParticipantsPanel
              userRole={userRole}
              displayName={displayName}
              participants={participants}
            />
          </div>

          <div className="space-y-6">
            {session.type === "verdict" && (
              <AIPanel scope={session.scope} context={session.context} />
            )}

            <SessionSharePanel sessionId={session.id} />

            {isConnected && !isEnded && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold">Audio</h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground">
                        Output (speaker)
                      </label>
                      <button
                        type="button"
                        className="text-xs underline text-muted-foreground hover:text-foreground"
                        onClick={() => void refreshOutputDevices()}
                      >
                        Refresh
                      </button>
                    </div>

                    <select
                      className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={selectedOutputDeviceId}
                      onChange={(e) => setSelectedOutputDeviceId(e.target.value)}
                    >
                      {(outputDevices.length
                        ? outputDevices
                        : [{ deviceId: "default", label: "System default" }]
                      ).map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-muted-foreground">
                      If labels are blank, grant mic permission once (browser
                      limitation).
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-sm px-3 py-2 rounded-md border border-border hover:bg-muted"
                      onClick={handleTestSpeaker}
                    >
                      {speakerTestStatus === "playing"
                        ? "Testing…"
                        : speakerTestStatus === "done"
                          ? "Heard it?"
                          : "Test speaker"}
                    </button>

                    <button
                      type="button"
                      className="text-sm px-3 py-2 rounded-md border border-border hover:bg-muted"
                      onClick={handleReconnectAudio}
                    >
                      Reconnect audio
                    </button>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-background/30 p-3">
                    {(() => {
                      const entries = Object.entries(remoteAudioLevels)
                        .filter(([id]) => id !== "local")
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);

                      const max = entries.length ? entries[0][1] : 0;

                      return (
                        <>
                          <p className="text-xs text-muted-foreground">
                            Remote audio detected:{" "}
                            <span className="text-foreground">
                              {max > 0.02 || remoteAudioTrackCount > 0 ? "Yes" : "No"}
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Remote audio tracks attached: {remoteAudioTrackCount}
                          </p>

                          {entries.length > 0 ? (
                            <div className="mt-2 space-y-1">
                              {entries.map(([id, level]) => (
                                <div
                                  key={id}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="text-muted-foreground">
                                    {participantNameById.get(id) ?? id}
                                  </span>
                                  <span className="text-foreground">
                                    {level.toFixed(3)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Waiting for remote audio…
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {audioDiagError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                      {audioDiagError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isHost && canEndSession && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Join requests</h3>
                  <span className="text-xs text-muted-foreground">
                    {isRefreshingRequests ? "Refreshing…" : `${pendingRequests.length}`}
                  </span>
                </div>

                {pendingRequests.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No pending requests.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.requestId}
                        className="rounded-lg border border-border/60 bg-background/30 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-foreground">
                              Request: <span className="font-mono">{req.requestId}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Role: {req.requestedRole}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-xs px-3 py-1 rounded-md border border-border hover:bg-muted"
                              onClick={() => handleDeny(req.requestId)}
                            >
                              Deny
                            </button>
                            <button
                              type="button"
                              className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90"
                              onClick={() => handleAdmit(req.requestId)}
                            >
                              Admit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <EndSessionModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleConfirmEnd}
      />

      <LeaveCallModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleConfirmLeave}
        role={userRole === "observer" ? "observer" : "participant"}
      />
    </div>
  );
}
