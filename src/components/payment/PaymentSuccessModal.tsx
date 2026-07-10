import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  amount: number;
  userName: string;
  userEmail: string;
  invoiceNumber?: string;
}

export function PaymentSuccessModal({
  isOpen,
  onOpenChange,
  transactionId,
  amount,
  userName,
  userEmail,
  invoiceNumber,
}: PaymentSuccessModalProps) {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 600;
      const end = Date.now() + duration;

      const colors = ["#0EA5E9", "#8B5CF6", "#EC4899"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors,
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors,
          disableForReducedMotion: true,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Show content after a brief delay for the checkmark animation
      setTimeout(() => setShowContent(true), 200);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-4 py-6">
          {/* Animated checkmark */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full animate-ping opacity-75" />
            <div className="relative flex items-center justify-center w-20 h-20 bg-green-500 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-white animate-in zoom-in duration-500" />
            </div>
          </div>

          {showContent && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Success message */}
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  🎉 Seat confirmed — welcome aboard, {userName}!
                </h2>
                <p className="text-muted-foreground text-sm">
                  We're thrilled to have you join us
                </p>
              </div>

              {/* Payment details */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">✅ Payment received:</span>
                  <span className="font-semibold">₹{amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">🪪 Transaction ID:</span>
                  <span className="font-mono text-xs">{transactionId.slice(0, 20)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">📄 Invoice sent to:</span>
                  <span className="text-xs truncate max-w-[180px]">{userEmail}</span>
                </div>
                {invoiceNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">📋 Invoice number:</span>
                    <span className="font-mono text-xs">{invoiceNumber}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/dashboard");
                  }}
                  className="w-full"
                  size="lg"
                >
                  View Your Dashboard
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                {invoiceNumber && (
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      // In a real implementation, this would download the invoice PDF
                      window.open(`/api/invoice/${invoiceNumber}`, '_blank');
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice (PDF)
                  </Button>
                )}
              </div>

              {/* Footer message */}
              <p className="text-xs text-muted-foreground pt-2">
                Check your email for your GST invoice and next steps
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
