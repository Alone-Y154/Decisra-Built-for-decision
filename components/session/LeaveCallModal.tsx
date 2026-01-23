import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LeaveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  role: "participant" | "observer";
}

export function LeaveCallModal({
  isOpen,
  onClose,
  onConfirm,
  role,
}: LeaveCallModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Call</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {role === "observer"
                ? "You will stop observing and leave the call."
                : "You will leave the call."}
            </p>
            <p className="text-muted-foreground">
              You can request access again from the session page.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Leave</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
