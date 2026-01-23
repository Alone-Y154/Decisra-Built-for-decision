export type ApiErrorPayload = {
  error?: string;
};

export class ApiHttpError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.payload = payload;
  }
}

export const getApiBaseUrl = () => {
  // When NEXT_PUBLIC_API_BASE_URL is set, prefer it (backend lives elsewhere).
  // Otherwise, fall back to same-origin.
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/+$/, "") : "";
};

export const apiUrl = (path: string) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export async function apiFetchJson<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    hostToken?: string | null;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {}
): Promise<{ status: number; data: T }> {
  const { method = "GET", body, hostToken, headers, signal } = options;

  const url = apiUrl(path);

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers ?? {}),
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (hostToken) {
    requestHeaders.Authorization = `Bearer ${hostToken}`;
  }

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const text = await res.text();
  const parsed: unknown = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const maybeError = parsed as ApiErrorPayload | null;
    const message =
      typeof maybeError?.error === "string"
        ? maybeError.error
        : `Request failed (${res.status})`;
    throw new ApiHttpError(res.status, message, parsed);
  }

  return { status: res.status, data: parsed as T };
}

const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};
