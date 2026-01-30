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
          <AlertDialogDescription>
            <span className="block">
              {role === "observer"
                ? "You will stop observing and leave the call."
                : "You will leave the call."}
            </span>
            <span className="mt-2 block text-muted-foreground">
              You can request access again from the session page.
            </span>
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
