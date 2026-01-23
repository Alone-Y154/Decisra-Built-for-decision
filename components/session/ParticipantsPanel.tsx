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
}

export function ParticipantsPanel({
  userRole,
  displayName,
  participants,
}: ParticipantsPanelProps) {
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
          <div key={p.id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground">{p.name}</span>
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
