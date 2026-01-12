import { Mic, MicOff, PhoneOff, Headphones } from "lucide-react";

interface AudioControlsProps {
  isConnected: boolean;
  isMuted: boolean;
  isObserver?: boolean;
  onToggleMute: () => void;
  onLeave: () => void;
}

export function AudioControls({
  isConnected,
  isMuted,
  isObserver = false,
  onToggleMute,
  onLeave,
}: AudioControlsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          {isObserver ? (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Headphones className="w-6 h-6 text-muted-foreground" />
            </div>
          ) : (
            <button
              onClick={onToggleMute}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              aria-label={isMuted ? "Unmute" : "Mute"}
              type="button"
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
          )}

          <button
            onClick={onLeave}
            className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center transition-colors"
            aria-label="Leave session"
            type="button"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          {!isConnected
            ? "Connecting..."
            : isObserver
              ? "You are observing (listen only)"
              : isMuted
                ? "You are muted"
                : "You are unmuted"}
        </p>
      </div>
    </div>
  );
}
