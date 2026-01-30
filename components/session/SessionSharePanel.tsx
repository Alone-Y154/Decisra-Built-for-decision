"use client";

import { Copy, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface SessionSharePanelProps {
  sessionId: string;
}

export function SessionSharePanel({ sessionId }: SessionSharePanelProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = useMemo(() => {
    return origin ? `${origin}/session/${sessionId}` : `/session/${sessionId}`;
  }, [origin, sessionId]);

  const handleCopy = () => {
    if (typeof navigator === "undefined") return;
    void navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold mb-4">Share This Session</h3>
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-background/50 break-all text-xs">
          {shareUrl}
        </div>
        <Button onClick={handleCopy} size="sm" variant="outline" className="w-full">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
