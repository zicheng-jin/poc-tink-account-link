import { CheckCircle2 } from 'lucide-react';

interface SuccessBannerProps {
  paymentRequestId?: string | null;
}

export function SuccessBanner({ paymentRequestId }: SuccessBannerProps) {
  return (
    <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-start gap-3 animate-fade-in">
      <div className="shrink-0 mt-0.5">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-green-800">Bank account linked successfully</p>
        {paymentRequestId && (
          <p className="text-xs text-green-600 font-mono mt-0.5 break-all">
            {paymentRequestId}
          </p>
        )}
      </div>
    </div>
  );
}
