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
  joinRequestId?: string;
};

type JoinRequestsResponse = {
  requests: Array<{
    requestId: string;
    requestedRole: "participant" | "observer";
    name?: string;
    displayName?: string;
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
  isLocal?: boolean;
};

type AudioDeviceOption = { deviceId: string; label: string };

type DecisraAppMessage =
  | { type: "decisra:session-ended"; sessionId?: string }
  | { type: "decisra:session-ending"; sessionId?: string };

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

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL, []);

  const [session, setSession] = useState<Session | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const [displayName, setDisplayName] = useState<string>("You");
  const [userRole, setUserRole] = useState<"host" | "participant" | "observer">(
    "participant"
  );
  // Default to muted on entry to avoid accidental hot-mic.
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [dailyToken, setDailyToken] = useState<string | null>(null);
  const [joinRequestId, setJoinRequestId] = useState<string | null>(null);

  const [isEnded, setIsEnded] = useState(false);
  const [endVariant, setEndVariant] = useState<"ended" | "left" | "missing">(
    "ended"
  );
  const [showEndModal, setShowEndModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [joinAttempt, setJoinAttempt] = useState(0);

  const isLeavingRef = useRef(false);

  const safeDaily = (fn: () => void) => {
    try {
      fn();
    } catch (err) {
      // daily-js throws "Use after destroy" if a method is called after destroy().
      // This can happen in React effect cleanups during navigation.
      if (err instanceof Error && /use after destroy/i.test(err.message)) return;
      // Ignore other cleanup errors as well; leaving should never crash the app.
    }
  };

  const safeDailyValue = <T,>(fn: () => T): T | undefined => {
    try {
      return fn();
    } catch (err) {
      if (err instanceof Error && /use after destroy/i.test(err.message)) return;
      return;
    }
  };



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
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [lastSpokeAt, setLastSpokeAt] = useState<Record<string, number>>({});
  const [showAudioDiagnostics, setShowAudioDiagnostics] = useState(false);

  const callRef = useRef<DailyCall | null>(null);
  const joinInFlightRef = useRef(false);

  const anonNameByIdRef = useRef<Map<string, string>>(new Map());
  const anonCountersRef = useRef({ participant: 0, observer: 0 });

  const joinRequestNameByIdRef = useRef<Map<string, string>>(new Map());
  const joinRequestCountersRef = useRef({ participant: 0, observer: 0 });

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

  const localParticipantId = useMemo(() => {
    return participants.find((p) => p.isLocal)?.id ?? "local";
  }, [participants]);

  const getAnonymousName = (id: string, role: UiParticipant["role"]) => {
    const existing = anonNameByIdRef.current.get(id);
    if (existing) return existing;

    if (role === "observer") {
      anonCountersRef.current.observer += 1;
      const name = `Observer ${anonCountersRef.current.observer}`;
      anonNameByIdRef.current.set(id, name);
      return name;
    }

    if (role === "participant") {
      anonCountersRef.current.participant += 1;
      const name = `Participant ${anonCountersRef.current.participant}`;
      anonNameByIdRef.current.set(id, name);
      return name;
    }

    // Host fallback
    anonNameByIdRef.current.set(id, "Host");
    return "Host";
  };

  const getJoinRequestDisplayName = (req: JoinRequestsResponse["requests"][number]) => {
    const record = req as unknown as Record<string, unknown>;
    const explicitName =
      (typeof record.displayName === "string" && record.displayName.trim())
        ? record.displayName.trim()
        : (typeof record.name === "string" && record.name.trim())
          ? record.name.trim()
          : null;
    if (explicitName) return explicitName;

    const existing = joinRequestNameByIdRef.current.get(req.requestId);
    if (existing) return existing;

    if (req.requestedRole === "observer") {
      joinRequestCountersRef.current.observer += 1;
      const label = `Observer ${joinRequestCountersRef.current.observer}`;
      joinRequestNameByIdRef.current.set(req.requestId, label);
      return label;
    }

    joinRequestCountersRef.current.participant += 1;
    const label = `Participant ${joinRequestCountersRef.current.participant}`;
    joinRequestNameByIdRef.current.set(req.requestId, label);
    return label;
  };

  useEffect(() => {
    // Cleanup join-request name cache for requests that are no longer pending.
    const active = new Set(pendingRequests.map((r) => r.requestId));
    for (const key of Array.from(joinRequestNameByIdRef.current.keys())) {
      if (!active.has(key)) joinRequestNameByIdRef.current.delete(key);
    }
  }, [pendingRequests]);

  const speakingParticipantIds = useMemo(() => {
    const threshold = 0.015;
    const holdMs = 900;
    const now = Date.now();
    const ids = new Set<string>();

    const canSpeakLocally = userRole !== "observer" && !isMuted;
    if (canSpeakLocally && localAudioLevel > threshold) ids.add(localParticipantId);

    // Hold highlights briefly to avoid flicker.
    for (const [id, ts] of Object.entries(lastSpokeAt)) {
      if (now - ts <= holdMs) ids.add(id);
    }

    for (const [id, level] of Object.entries(remoteAudioLevels)) {
      if (level > threshold) ids.add(id);
    }

    return Array.from(ids);
  }, [isMuted, lastSpokeAt, localAudioLevel, localParticipantId, remoteAudioLevels, userRole]);

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

    // If the user previously left voluntarily, they must request permission again
    // even if browser history tries to restore /live.
    const mustReRequest =
      typeof window === "undefined"
        ? false
        : sessionStorage.getItem(`decisra:mustReRequest:${sessionId}`) === "1";

    if (mustReRequest) {
      setIsConnected(false);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`decisra:join:${sessionId}`);
        sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
      }
      router.replace(`/session/${sessionId}`);
      return;
    }

    // If user hasn't joined, send them back to preview.
    const joinRaw =
      typeof window === "undefined"
        ? null
        : sessionStorage.getItem(`decisra:join:${sessionId}`);

    if (!joinRaw) {
      // No join record means the user has not been admitted (or they already left).
      // Send them back to the preview to request permission again.
      setIsConnected(false);
      router.replace(`/session/${sessionId}`);
      return;
    }

    try {
      const join = JSON.parse(joinRaw) as JoinStorage;
      const storedName = sessionStorage.getItem(`decisra:displayName:${sessionId}`);
      if (storedName) setDisplayName(storedName);

      if (typeof join.joinRequestId === "string" && join.joinRequestId) {
        setJoinRequestId(join.joinRequestId);
      }

      const roleFromJoin = join.assignedRole;
      const effectiveRole: "host" | "participant" | "observer" =
        roleFromJoin === "host"
          ? "host"
          : roleFromJoin === "observer"
            ? "observer"
            : "participant";

      setUserRole(effectiveRole);
      // Everyone joins muted by default (including host/participant).
      setIsMuted(true);

      if (typeof join.roomUrl === "string" && typeof join.dailyToken === "string") {
        setRoomUrl(join.roomUrl);
        setDailyToken(join.dailyToken);
      } else {
        setLoadError("Missing call credentials. Please request access again.");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(`decisra:join:${sessionId}`);
        }
        router.replace(`/session/${sessionId}`);
      }
    } catch {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`decisra:join:${sessionId}`);
      }
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
    if (isLeavingRef.current) return;
    void refreshOutputDevices();
  }, [isConnected, isEnded]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEnded) return;

    const callObject = callRef.current;
    if (!callObject) return;

    // Fallback for "who's speaking" that doesn't rely on AudioWorklet support.
    // Daily emits active-speaker-change when active speaker mode is enabled.
    try {
      callObject.setActiveSpeakerMode?.(true);
    } catch {
      // ignore
    }

    const onActiveSpeakerChange = (evt: unknown) => {
      const record = evt as { activeSpeaker?: { peerId?: unknown } };
      const peerId = record.activeSpeaker?.peerId;
      if (typeof peerId !== "string" || !peerId) return;
      setLastSpokeAt((prev) => ({ ...prev, [peerId]: Date.now() }));
    };

    callObject.on("active-speaker-change", onActiveSpeakerChange as never);
    return () => {
      safeDaily(() =>
        callObject.off("active-speaker-change", onActiveSpeakerChange as never)
      );
    };
  }, [isConnected, isEnded]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEnded) return;

    const callObject = callRef.current;
    if (!callObject) return;

    // Publish our role so other clients can distinguish observer vs participant.
    void Promise.resolve(
      safeDailyValue(() =>
        (callObject as unknown as {
          setUserData?: (data: unknown) => unknown;
        }).setUserData?.({ role: userRole })
      )
    ).catch(() => {
      // ignore
    });

    let cancelled = false;

    // Start observer so getLocalAudioLevel() actually updates.
    void Promise.resolve(
      safeDailyValue(() =>
        (callObject as unknown as {
          startLocalAudioLevelObserver?: (intervalMs?: number) => Promise<void>;
        }).startLocalAudioLevelObserver?.(200)
      )
    ).catch(() => {
      // ignore (unsupported browser)
    });

    const intervalId = window.setInterval(() => {
      if (cancelled) return;
      if (isLeavingRef.current) return;
      try {
        const maybe = callObject as unknown as {
          getLocalAudioLevel?: () => number;
        };
        if (typeof maybe.getLocalAudioLevel !== "function") {
          setLocalAudioLevel(0);
          return;
        }

        const level = maybe.getLocalAudioLevel();
        if (typeof level === "number" && Number.isFinite(level)) {
          setLocalAudioLevel(level);
          if (level > 0.015) {
            setLastSpokeAt((prev) => ({ ...prev, [localParticipantId]: Date.now() }));
          }
        }
      } catch {
        // ignore
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);

      void Promise.resolve(
        safeDailyValue(() =>
          (callObject as unknown as { stopLocalAudioLevelObserver?: () => void })
            .stopLocalAudioLevelObserver?.()
        )
      ).catch(() => {
        // ignore
      });
    };
  }, [isConnected, isEnded, localParticipantId, userRole]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEnded) return;
    if (isLeavingRef.current) return;

    const callObject = callRef.current;
    if (!callObject) return;

    let intervalId: number | null = null;
    let cancelled = false;

    (async () => {
      try {
        const promise = safeDailyValue(() =>
          callObject.startRemoteParticipantsAudioLevelObserver(200)
        );
        if (promise) await promise;
      } catch {
        // ignore
      }

      intervalId = window.setInterval(() => {
        if (cancelled) return;
        if (isLeavingRef.current) return;
        try {
          const levels =
            callObject.getRemoteParticipantsAudioLevel() as Record<string, number>;
          setRemoteAudioLevels(levels);
          const now = Date.now();
          const threshold = 0.015;
          const updates: Record<string, number> = {};
          for (const [id, level] of Object.entries(levels)) {
            if (level > threshold) updates[id] = now;
          }
          if (Object.keys(updates).length) {
            setLastSpokeAt((prev) => ({ ...prev, ...updates }));
          }
        } catch {
          // ignore
        }
      }, 300);
    })();

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      safeDaily(() => callObject.stopRemoteParticipantsAudioLevelObserver());
    };
  }, [isConnected, isEnded]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isConnected) return;
    if (isEnded) return;

    const callObject = callRef.current;
    if (!callObject) return;

    const audioEls = remoteAudioElsRef.current;

    const ensureAudioEl = async (sessionIdForAudio: string) => {
      const existing = audioEls.get(sessionIdForAudio);
      if (existing) return existing;

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.setAttribute("playsinline", "true");
      audio.muted = false;
      audio.volume = 1;

      audioEls.set(sessionIdForAudio, audio);

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
      const audio = audioEls.get(sessionIdForAudio);
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
      audioEls.delete(sessionIdForAudio);
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
      safeDaily(() => callObject.off("track-started", onTrackStarted as never));
      safeDaily(() => callObject.off("track-stopped", onTrackStopped as never));
      safeDaily(() => callObject.off("participant-left", onParticipantLeft as never));

      for (const id of Array.from(audioEls.keys())) {
        cleanupAudioEl(id);
      }
    };
  }, [isConnected, isEnded, selectedOutputDeviceId]);

  useEffect(() => {
    if (!isConnected) return;
    if (isEnded) return;
    if (isLeavingRef.current) return;
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
    const promise = safeDailyValue(() =>
      callObject.setOutputDeviceAsync({ outputDeviceId: selectedOutputDeviceId })
    );
    if (!promise) return;

    void Promise.resolve(promise)
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
      if (isLeavingRef.current) return;

      joinInFlightRef.current = true;
      setIsConnected(false);
      setLoadError(null);

      try {
        callObject = DailyIframe.createCallObject();
        callRef.current = callObject;

        if (cancelled || isLeavingRef.current) return;

        // Proactively disable mic before join to avoid any brief capture window.
        try {
          await Promise.resolve(callObject.setLocalAudio(false));
        } catch {
          // ignore
        }

        if (cancelled || isLeavingRef.current) return;

        await callObject.join({ url: roomUrl, token: dailyToken });

        if (cancelled || isLeavingRef.current) return;

        // Enforce muted state immediately after join as well.
        try {
          await Promise.resolve(callObject.setLocalAudio(false));
        } catch {
          // ignore
        }

        if (cancelled || isLeavingRef.current) return;
        setIsConnected(true);
      } catch (err) {
        if (cancelled || isLeavingRef.current) return;
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
          session_id?: unknown;
          user_data?: unknown;
          userData?: unknown;
        };

        const isLocal = record.local === true;
        const isOwner = record.owner === true;
        const stableId = typeof record.session_id === "string" ? record.session_id : id;

        const userData =
          (record.user_data as Record<string, unknown> | undefined) ??
          (record.userData as Record<string, unknown> | undefined);

        const roleFromUserData = userData?.role;

        const role: UiParticipant["role"] = isLocal
          ? userRole
          : isOwner
            ? "host"
            : roleFromUserData === "observer"
              ? "observer"
              : "participant";

        const rawUserName =
          typeof record.user_name === "string" ? record.user_name.trim() : "";

        // Daily can default remote names to placeholders like "You" / "Guest".
        // For remote users, treat those as unnamed so we can apply our own labels.
        const isPlaceholderName = /^(you|guest)$/i.test(rawUserName);
        const hasRealUserName = !!rawUserName && !isPlaceholderName;

        const nameFromDaily = isLocal
          ? "You"
          : hasRealUserName
            ? rawUserName
            : role === "host"
              ? "Host"
              : getAnonymousName(stableId, role);

        return { id: stableId, name: nameFromDaily, role, isLocal };
      });

      // Put local participant first for a nicer UX.
      list.sort((a, b) => (a.isLocal ? -1 : b.isLocal ? 1 : 0));
      setParticipants(list);

      // Cleanup anonymous name cache for participants that left.
      const active = new Set(list.map((p) => p.id));
      for (const key of Array.from(anonNameByIdRef.current.keys())) {
        if (!active.has(key)) anonNameByIdRef.current.delete(key);
      }
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
      safeDaily(() => callObject.off("participant-joined", onChange));
      safeDaily(() => callObject.off("participant-updated", onChange));
      safeDaily(() => callObject.off("participant-left", onChange));
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
    if (!isConnected) return;
    if (isEnded) return;

    const callObject = callRef.current;
    if (!callObject) return;

    const onAppMessage = (evt: unknown) => {
      const record = evt as { data?: unknown };
      const data = record.data as DecisraAppMessage | undefined;
      if (!data || typeof data !== "object") return;

      if (data.type === "decisra:session-ended" || data.type === "decisra:session-ending") {
        // Ensure /live cannot be revisited without requesting permission again.
        if (typeof window !== "undefined" && sessionId) {
          sessionStorage.removeItem(`decisra:join:${sessionId}`);
          sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
        }

        setEndVariant("ended");
        setIsEnded(true);
        setIsConnected(false);

        if (sessionId) router.replace(`/session/${sessionId}?ended=1`);
      }
    };

    const onLeftMeeting = () => {
      // If the user clicked "Leave", Daily will emit left-meeting. That is not a session end.
      if (isLeavingRef.current) return;

      if (typeof window !== "undefined" && sessionId) {
        sessionStorage.removeItem(`decisra:join:${sessionId}`);
        sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
      }

      setEndVariant("ended");
      setIsEnded(true);
      setIsConnected(false);

      if (sessionId) router.replace(`/session/${sessionId}?ended=1`);
    };

    callObject.on("app-message", onAppMessage as never);
    callObject.on("left-meeting", onLeftMeeting as never);
    return () => {
      safeDaily(() => callObject.off("app-message", onAppMessage as never));
      safeDaily(() => callObject.off("left-meeting", onLeftMeeting as never));
    };
  }, [isConnected, isEnded, router, sessionId]);

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
          if (!cancelled && err.status === 410) {
            setEndVariant("ended");
            setIsEnded(true);
            setIsConnected(false);
            return;
          }
          if (!cancelled && err.status === 404) {
            setEndVariant("missing");
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
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(`decisra:expiresAt:${sessionId}`);
    const parsed = raw ? Number(raw) : NaN;
    if (!Number.isFinite(parsed)) return;
    setExpiresAt(parsed);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    if (!expiresAt) return;
    if (isEnded) return;

    const now = Date.now();
    if (now >= expiresAt) {
      setEndVariant("ended");
      setIsEnded(true);
      setIsConnected(false);
      return;
    }

    const ms = Math.max(0, expiresAt - now);
    const timeoutId = window.setTimeout(() => {
      setEndVariant("ended");
      setIsEnded(true);
      setIsConnected(false);
    }, ms);

    return () => window.clearTimeout(timeoutId);
  }, [expiresAt, isEnded, sessionId]);

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
                setEndVariant("ended");
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
        sessionStorage.removeItem(`decisra:expiresAt:${sessionId}`);
        sessionStorage.removeItem(`decisra:mustReRequest:${sessionId}`);
        if (isHost) {
          sessionStorage.removeItem(`decisra:hostToken:${sessionId}`);
        }
      }
    });
  }, [isEnded, isHost, sessionId]);

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

    isLeavingRef.current = true;
    setIsConnected(false);

    // Prevent accidental immediate re-entry via browser back/forward or by
    // pasting /live again.
    if (typeof window !== "undefined" && sessionId) {
      sessionStorage.setItem(`decisra:mustReRequest:${sessionId}`, "1");
      sessionStorage.setItem(`decisra:leftNotice:${sessionId}`, "1");
      sessionStorage.removeItem(`decisra:join:${sessionId}`);
      sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
    }

    // Best-effort detach immediately.
    void leaveCall();

    // Replace so browser back doesn't land on /live.
    router.replace(`/session/${sessionId}`);
  };

  const handleConfirmEnd = async () => {
    if (!sessionId) return;
    if (!hostToken) {
      setShowEndModal(false);
      return;
    }

    // Immediately notify connected clients (participants/observers) via Daily.
    // This makes the end-state UI appear without requiring refresh.
    try {
      callRef.current?.sendAppMessage?.(
        { type: "decisra:session-ending", sessionId } satisfies DecisraAppMessage,
        "*"
      );
    } catch {
      // ignore
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

      // Confirm to all clients that the session is ended.
      try {
        callRef.current?.sendAppMessage?.(
          { type: "decisra:session-ended", sessionId } satisfies DecisraAppMessage,
          "*"
        );
      } catch {
        // ignore
      }

      await leaveCall();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`decisra:join:${sessionId}`);
        sessionStorage.removeItem(`decisra:joinRequest:${sessionId}`);
        sessionStorage.removeItem(`decisra:hostToken:${sessionId}`);
      }
      setShowEndModal(false);
      setEndVariant("ended");
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

  if (isEnded) {
    return <SessionEnded onStartNew={handleStartNew} variant={endVariant} />;
  }

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
    <div className="min-h-screen bg-background flex flex-col">
      <div ref={remoteAudioContainerRef} className="hidden" aria-hidden="true" />
      <SessionHeader session={session} expiresAt={expiresAt} />

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
              speakingParticipantIds={speakingParticipantIds}
            />
          </div>

          <div className="space-y-6">
            {session.type === "verdict" && userRole !== "observer" && (
              <AIPanel
                sessionId={session.id}
                role={userRole === "host" ? "host" : "participant"}
                hostToken={userRole === "host" ? hostToken : null}
                requestId={userRole === "host" ? null : joinRequestId}
                scope={session.scope}
                context={session.context}
              />
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

                  <button
                    type="button"
                    className="text-xs underline text-muted-foreground hover:text-foreground"
                    onClick={() => setShowAudioDiagnostics((v) => !v)}
                  >
                    {showAudioDiagnostics ? "Hide diagnostics" : "Show diagnostics"}
                  </button>

                  {showAudioDiagnostics && (
                    <div className="rounded-lg border border-border/60 bg-background/30 p-3">
                      {(() => {
                        const entries = Object.entries(remoteAudioLevels)
                          .filter(([id]) => id !== localParticipantId)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5);

                        return entries.length > 0 ? (
                          <div className="space-y-1">
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
                          <p className="text-xs text-muted-foreground">
                            No remote audio levels yet.
                          </p>
                        );
                      })()}
                    </div>
                  )}

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
                            <p className="text-sm font-medium text-foreground">
                              {getJoinRequestDisplayName(req)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Requested role: {req.requestedRole}
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
                              //bg-accent text-accent-foreground font-semibold shadow-lg hover:shadow-[0_0_40px_hsl(38_92%_50%/0.3)] hover:scale-[1.02] active:scale-[0.98]
                              className="text-xs px-3 py-1 rounded-md bg-accent font-semibold text-accent-foreground hover:opacity-90"
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
