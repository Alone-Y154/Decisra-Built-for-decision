import { User, Crown, Eye, Mic } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: "host" | "participant" | "observer";
}

interface ParticipantsPanelProps {
  userRole: "host" | "participant" | "observer" | null;
  displayName: string;
  participants?: Participant[];
  speakingParticipantIds?: string[];
}

export function ParticipantsPanel({
  userRole,
  displayName,
  participants,
  speakingParticipantIds,
}: ParticipantsPanelProps) {
  const speakingSet = new Set(speakingParticipantIds ?? []);

  const getRoleIcon = (role: Participant["role"]) => {
    switch (role) {
      case "host":
        return <Crown className="w-3 h-3" />;
      case "observer":
        return <Eye className="w-3 h-3" />;
      default:
        return <Mic className="w-3 h-3" />;
    }
  };

  const getRoleLabel = (role: Participant["role"]) => {
    switch (role) {
      case "host":
        return "Host";
      case "observer":
        return "Observer";
      default:
        return "Participant";
    }
  };

  const fallbackCurrentUser: Participant = {
    id: "self",
    name: displayName || "You",
    role: userRole || "participant",
  };

  const list = participants && participants.length > 0 ? participants : [fallbackCurrentUser];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Participants</h3>

      <div className="space-y-3">
        {list.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-between py-2 -mx-2 px-2 rounded-md ${
              speakingSet.has(p.id) ? "bg-primary/10" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  speakingSet.has(p.id)
                    ? "bg-emerald-500/10 ring-2 ring-emerald-500 shadow-[0_0_0.75rem_rgba(16,185,129,0.35)]"
                    : "bg-muted"
                }`}
              >
                <User
                  className={`w-4 h-4 transition-colors ${
                    speakingSet.has(p.id)
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }`}
                />
                {speakingSet.has(p.id) && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{p.name}</span>
                {speakingSet.has(p.id) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Speaking
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getRoleIcon(p.role)}
              <span>{getRoleLabel(p.role)}</span>
            </div>
          </div>
        ))}
      </div>

      {userRole === "observer" && (
        <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
          You are observing. You can listen but cannot speak.
        </p>
      )}
    </div>
  );
}
