type FetchSseOptions = {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onEvent: (event: { event: string; data: string }) => void;
};

export class SseHttpError extends Error {
  status: number;
  bodyText: string;

  constructor(status: number, bodyText: string) {
    super(bodyText ? `SSE request failed (${status}): ${bodyText}` : `SSE request failed (${status})`);
    this.name = "SseHttpError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

// Minimal SSE client that works with Authorization headers (unlike EventSource).
// Expects server to respond with `Content-Type: text/event-stream`.
export async function fetchSse(url: string, options: FetchSseOptions) {
  const { method = "GET", headers, signal, onEvent } = options;

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "text/event-stream",
      ...(headers ?? {}),
    },
    signal,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new SseHttpError(res.status, text);
  }

  if (!res.body) {
    throw new Error("SSE response has no body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let eventName = "message";
  let dataBuffer = "";

  const dispatch = () => {
    const data = dataBuffer.endsWith("\n") ? dataBuffer.slice(0, -1) : dataBuffer;
    if (data.length > 0) {
      onEvent({ event: eventName || "message", data });
    }
    eventName = "message";
    dataBuffer = "";
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines; keep any partial line in `buffer`.
      let lineBreakIndex = buffer.indexOf("\n");
      while (lineBreakIndex !== -1) {
        const rawLine = buffer.slice(0, lineBreakIndex);
        buffer = buffer.slice(lineBreakIndex + 1);

        const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;

        if (line === "") {
          dispatch();
        } else if (line.startsWith(":")) {
          // Comment / keep-alive line, ignore.
        } else if (line.startsWith("event:")) {
          eventName = line.slice("event:".length).trim() || "message";
        } else if (line.startsWith("data:")) {
          dataBuffer += line.slice("data:".length).trimStart() + "\n";
        }

        lineBreakIndex = buffer.indexOf("\n");
      }
    }

    // Flush last event if stream ends without trailing blank line.
    if (dataBuffer.length > 0) dispatch();
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}

export function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
