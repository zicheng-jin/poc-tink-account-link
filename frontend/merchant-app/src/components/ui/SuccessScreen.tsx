import { CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Card';

interface SuccessScreenProps {
  title?: string;
  subtitle?: string;
  paymentRequestId?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SuccessScreen({
  title = 'Payment Authorized',
  subtitle = 'Your bank account has been linked. Your order is confirmed.',
  paymentRequestId,
  actionLabel = 'Continue',
  onAction,
}: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">{subtitle}</p>
        {paymentRequestId && (
          <div className="mb-6">
            <p className="text-xs text-slate-400 mb-1">Payment Request ID</p>
            <Badge variant="outline" className="font-mono text-xs break-all">
              {paymentRequestId}
            </Badge>
          </div>
        )}
        {onAction && (
          <Button onClick={onAction} className="w-full">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
