export type SessionType = "normal" | "verdict";

export interface Session {
  id: string;
  type: SessionType;
  scope?: string;
  context?: string;
  expiresAt?: number;
}
