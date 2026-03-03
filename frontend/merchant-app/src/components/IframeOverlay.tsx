import { useRef } from 'react';
import { X } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useMerchantChannel } from '@/hooks/useMerchantChannel';

interface IframeOverlayProps {
  url: string;
  onClose: () => void;
}

export function IframeOverlay({ url, onClose }: IframeOverlayProps) {
  const { setPaymentStatus, setPaymentRequestId, setError, closeIframe } = useCheckoutStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useMerchantChannel({
    onReady: () => {
      console.log('[IframeOverlay] ppb-app is ready');
    },
    onStepChange: (step) => {
      console.log('[IframeOverlay] ppb-app step changed:', step);
    },
    onSuccess: (paymentRequestId) => {
      console.log('[IframeOverlay] ✅ PPB_SUCCESS received:', paymentRequestId);
      setPaymentRequestId(paymentRequestId);
      setPaymentStatus('success');
      closeIframe();
    },
    onError: (message) => {
      console.error('[IframeOverlay] ❌ PPB_ERROR received:', message);
      setError(message);
      setPaymentStatus('error');
      closeIframe();
    },
    onCancelled: (message, reason, providerName) => {
      console.log('[IframeOverlay] ⚠️ PPB_CANCELLED received:', { message, reason, providerName });
      const label = providerName ? ` at ${providerName}` : '';
      const displayMsg = `Payment cancelled${label}${reason ? ': ' + reason : ''}`;
      setError(displayMsg);
      setPaymentStatus('error');
      closeIframe();
    },
    onClose: () => {
      closeIframe();
    },
  });

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Slide-in drawer panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-sm font-semibold text-slate-800">Pay by Bank</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Iframe */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={url}
            title="Pay by Bank"
            className="w-full h-full border-0"
            allow="payment"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </>
  );
}
