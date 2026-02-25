import { useEffect, useCallback } from 'react';
import { config } from '@/lib/config';

// Typed message contract — ppb-app sends, merchant-app receives
export type PpbInboundMessage =
  | { type: 'PPB_READY' }
  | { type: 'PPB_STEP_CHANGE'; step: number }
  | { type: 'PPB_SUCCESS'; paymentRequestId: string }
  | { type: 'PPB_ERROR'; message: string }
  | { type: 'PPB_CLOSE' };

interface UseMerchantChannelOptions {
  onReady?: () => void;
  onStepChange?: (step: number) => void;
  onSuccess: (paymentRequestId: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

/**
 * useMerchantChannel — used inside merchant-app to receive typed messages from ppb-app iframe.
 * Validates event.origin against config.ppbAppUrl for security.
 */
export function useMerchantChannel({
  onReady,
  onStepChange,
  onSuccess,
  onError,
  onClose,
}: UseMerchantChannelOptions) {
  const ppbOrigin = (() => {
    try {
      return new URL(config.ppbAppUrl).origin;
    } catch {
      return '';
    }
  })();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Strict origin check — only trust messages from ppb-app
      if (event.origin !== ppbOrigin) {
        console.warn('[useMerchantChannel] Ignored message from untrusted origin:', event.origin);
        return;
      }

      const msg = event.data as PpbInboundMessage;
      console.log('[useMerchantChannel] Received from ppb-app:', msg?.type, msg);

      switch (msg?.type) {
        case 'PPB_READY':
          onReady?.();
          break;
        case 'PPB_STEP_CHANGE':
          onStepChange?.(msg.step);
          break;
        case 'PPB_SUCCESS':
          onSuccess(msg.paymentRequestId);
          break;
        case 'PPB_ERROR':
          onError(msg.message);
          break;
        case 'PPB_CLOSE':
          onClose();
          break;
        default:
          // Unknown type — safe to ignore
          console.log('[useMerchantChannel] Unknown message type (ignored):', (msg as { type: string })?.type);
      }
    },
    [ppbOrigin, onReady, onStepChange, onSuccess, onError, onClose]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);
}
