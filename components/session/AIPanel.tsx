import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useVerdictAiRealtime, type VerdictAiRole } from "@/hooks/useVerdictAiRealtime";

interface AIPanelProps {
  sessionId: string;
  role: VerdictAiRole;
  hostToken?: string | null;
  requestId?: string | null;
  scope?: string;
  context?: string;
}

export function AIPanel({
  sessionId,
  role,
  hostToken = null,
  requestId = null,
  scope,
  context,
}: AIPanelProps) {
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const pendingConfigRef = useRef<{ scope: string; context: string } | null>(null);
  const configSentForCurrentConnectionRef = useRef(false);
  const {
    status,
    remaining,
    aiUsageCount,
    aiUsageLimit,
    error,
    messages,
    canSend,
    connect,
    sendEvent,
    sendUserMessage,
  } = useVerdictAiRealtime({
    sessionId,
    role,
    hostToken,
    requestId,
    autoConnect: false,
  });

  const isBusy = status === "preflighting" || status === "connecting";

  const headerStatus = useMemo(() => {
    if (status === "connected") return "Connected";
    if (status === "disabled") return "Disabled";
    if (status === "error") return "Disconnected";
    if (status === "preflighting") return "Checking quota…";
    if (status === "connecting") return "Connecting…";
    return "Idle";
  }, [status]);

  const handleConnectClick = async () => {
    setSendError(null);

    // Scope/context are configured at session creation time (not here). If present,
    // inject them as a system instruction once connected.
    const nextScope = (scope ?? "").trim();
    const nextContext = (context ?? "").trim();
    pendingConfigRef.current = nextScope || nextContext ? { scope: nextScope, context: nextContext } : null;

    try {
      await connect({ resetAttempts: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect";
      setSendError(message);
    }
  };

  // Inject configured scope/context once the socket becomes connected.
  useEffect(() => {
    if (status !== "connected") {
      configSentForCurrentConnectionRef.current = false;
      return;
    }
    if (configSentForCurrentConnectionRef.current) return;
    const pending = pendingConfigRef.current;
    if (!pending) return;

    const lines: string[] = [];
    lines.push("Verdict Session Context:");
    if (pending.scope) lines.push(`Scope: ${pending.scope}`);
    if (pending.context) lines.push(`Context: ${pending.context}`);
    const systemText = lines.join("\n");

    try {
      sendEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "system",
          content: [{ type: "input_text", text: systemText }],
        },
      });
      configSentForCurrentConnectionRef.current = true;
      pendingConfigRef.current = null;
    } catch {
      // If sending fails (rare), keep pending so it can be retried by reconnect.
    }
  }, [sendEvent, status]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;

    setSendError(null);
    try {
      await sendUserMessage(text);
      setInput("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      setSendError(message);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const renderFormattedText = (text: string) => {
    const normalized = text.replace(/\r\n/g, "\n").trim();

    return (
      <div className="space-y-3">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // Do NOT enable raw HTML rendering; we want safe markdown only.
          components={{
            p: ({ children }) => (
              <p className="whitespace-pre-wrap leading-relaxed">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
            ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="max-w-full overflow-x-auto rounded bg-muted p-3 text-[12px] leading-relaxed">
                {children}
              </pre>
            ),
          }}
        >
          {normalized}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Verdict AI</h3>
          <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Free Tier
          </span>
          <span className="ml-auto text-xs text-muted-foreground">{headerStatus}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Limited assistance, within scope only.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {typeof remaining === "number" && (
            <span className="text-[11px] rounded-full border border-border px-2 py-1 text-muted-foreground">
              Remaining: {remaining}
            </span>
          )}
          {typeof aiUsageCount === "number" && typeof aiUsageLimit === "number" && (
            <span className="text-[11px] rounded-full border border-border px-2 py-1 text-muted-foreground">
              Usage: {aiUsageCount}/{aiUsageLimit}
            </span>
          )}
          {scope?.trim() ? (
            <span className="text-[11px] rounded-full border border-border px-2 py-1 text-muted-foreground">
              Scope set
            </span>
          ) : null}
          {context?.trim() ? (
            <span className="text-[11px] rounded-full border border-border px-2 py-1 text-muted-foreground">
              Context set
            </span>
          ) : null}

          <div className="ml-auto flex gap-2">
            {/* <Button
              size="sm"
              variant={status === "connected" ? "outline" : "default"}
              onClick={() => void handleConnectClick()}
              disabled={status === "disabled" || isBusy}
              className="h-8"
              title={status === "connected" ? "Reconnect Verdict AI" : "Connect Verdict AI"}
            >
              Verdict AI
            </Button> */}
          </div>
        </div>

        {sendError && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {sendError}
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="h-64 overflow-y-auto p-4 pr-3 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-muted-foreground">
              Use AI to clarify trade-offs, summarize viewpoints, or reframe the
              decision — within the defined scope.
            </p>
            <p className="text-xs text-muted-foreground mt-2">AI usage is limited during this session.</p>

            {status !== "connected" && status !== "disabled" && (
              <Button
                onClick={() => void handleConnectClick()}
                disabled={isBusy}
                className="mt-4"
              >
                Verdict AI
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const isAssistant = message.role === "assistant";
              const isSystem = message.role === "system";

              const bubbleBase =
                "rounded-lg border px-3 py-2 text-sm transition-transform duration-150";
              const bubbleClass = isUser
                ? "bg-accent text-accent-foreground font-semibold shadow-lg border-accent/30 hover:shadow-[0_0_40px_hsl(38_92%_50%/0.3)] hover:scale-[1.02] active:scale-[0.98]"
                : isSystem
                  ? message.kind === "error"
                    ? "bg-destructive/10 text-destructive border-destructive/30"
                    : message.kind === "scope_violation"
                      ? "bg-amber-500/10 text-amber-700 border-amber-500/25"
                      : "bg-muted/40 text-foreground border-border shadow-sm"
                  : "bg-muted/40 text-foreground border-border shadow-sm";

              const containerClass = isUser
                ? "flex justify-end"
                : "flex justify-start";

              const label = isUser ? "You" : isAssistant ? "AI" : "System";

              return (
                <div key={message.id} className={containerClass}>
                  <div className={`max-w-[85%] min-w-0 break-words ${bubbleBase} ${bubbleClass}`}>
                    <div className="text-[11px] opacity-80 mb-1 font-medium">
                      {label}
                    </div>
                    {isAssistant || isSystem ? (
                      renderFormattedText(message.content)
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something related to the decision scope…"
            className="min-h-15 resize-none text-sm custom-scrollbar overflow-y-auto overflow-x-hidden"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={status !== "connected" || isBusy}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || !canSend || status === "disabled" || isBusy}
            className="shrink-0"
            title={canSend ? "Send" : "AI not connected"}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Staying aligned with the scope helps keep this session focused.
        </p>
      </div>
    </div>
  );
}
