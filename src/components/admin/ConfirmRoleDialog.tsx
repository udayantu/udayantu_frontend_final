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

interface ConfirmRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  newRole: string;
  onConfirm: () => void;
  loading: boolean;
}

export function ConfirmRoleDialog({
  open,
  onOpenChange,
  studentName,
  newRole,
  onConfirm,
  loading,
}: ConfirmRoleDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to change <span className="font-semibold">{studentName}'s</span> role to{" "}
            <span className="font-semibold text-primary">{newRole}</span>?
            <br /><br />
            This action will update their training modules and dashboard access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading ? "Updating..." : "Confirm Change"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
