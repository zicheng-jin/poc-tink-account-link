import { useCallback } from 'react';
import { config } from '@/lib/config';

// Typed message contract — ppb-app sends, merchant-app receives
export type PpbOutboundMessage =
  | { type: 'PPB_READY' }
  | { type: 'PPB_STEP_CHANGE'; step: number }
  | { type: 'PPB_SUCCESS'; paymentRequestId: string }
  | { type: 'PPB_ERROR'; message: string }
  | { type: 'PPB_CLOSE' };

/**
 * usePpbChannel — used inside ppb-app to send typed messages to the merchant parent.
 * Only sends when running inside an iframe (window.top !== window).
 * Targets config.merchantAppUrl origin for security.
 */
export function usePpbChannel() {
  const merchantOrigin = (() => {
    try {
      return new URL(config.merchantAppUrl).origin;
    } catch {
      return '*';
    }
  })();

  const isInsideIframe = window.top !== window;

  const sendMessage = useCallback(
    (message: PpbOutboundMessage) => {
      if (!isInsideIframe) {
        console.log('[usePpbChannel] Not inside iframe — skipped:', message.type);
        return;
      }
      console.log('[usePpbChannel] Sending to merchant:', message.type, message);
      try {
        window.top?.postMessage(message, merchantOrigin);
      } catch {
        // Fallback to direct parent if top throws
        window.parent?.postMessage(message, merchantOrigin);
      }
    },
    [merchantOrigin, isInsideIframe]
  );

  const sendReady = useCallback(
    () => sendMessage({ type: 'PPB_READY' }),
    [sendMessage]
  );

  const sendStepChange = useCallback(
    (step: number) => sendMessage({ type: 'PPB_STEP_CHANGE', step }),
    [sendMessage]
  );

  const sendSuccess = useCallback(
    (paymentRequestId: string) => sendMessage({ type: 'PPB_SUCCESS', paymentRequestId }),
    [sendMessage]
  );

  const sendError = useCallback(
    (message: string) => sendMessage({ type: 'PPB_ERROR', message }),
    [sendMessage]
  );

  const sendClose = useCallback(
    () => sendMessage({ type: 'PPB_CLOSE' }),
    [sendMessage]
  );

  return { sendReady, sendStepChange, sendSuccess, sendError, sendClose, isInsideIframe };
}
