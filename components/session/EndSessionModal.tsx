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

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function EndSessionModal({
  isOpen,
  onClose,
  onConfirm,
}: EndSessionModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End Session</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block">
              Ending the session will disconnect all participants. This session
              cannot be resumed.
            </span>
            <span className="mt-2 block text-muted-foreground">
              No data from this session will be saved.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>End Session</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
