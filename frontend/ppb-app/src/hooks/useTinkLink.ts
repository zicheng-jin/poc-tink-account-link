import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentStore } from '@/store/paymentStore';
import type { PaymentStep } from '@/store/paymentStore';

interface TinkErrorPayload {
  status: string;
  message: string;
  reason?: string;
  providerName?: string;
  trackingId?: string;
}

interface UseTinkLinkOptions {
  tinkUrl: string;
  mode: string;
  onError?: (status: string, message: string) => void;
  onCancelled?: (message: string, reason?: string, providerName?: string) => void;
  onStatus?: (loading: boolean) => void;
}

function getTinkOrigin(tinkUrl: string): string {
  try {
    const { protocol, host } = new URL(tinkUrl);
    return `${protocol}//${host}`;
  } catch {
    return 'https://link.tink.com';
  }
}

export function useTinkLink({ tinkUrl, mode, onError, onCancelled, onStatus }: UseTinkLinkOptions) {
  const navigate = useNavigate();
  const { setError, setStatus, setStep } = usePaymentStore();

  const tinkOrigin = getTinkOrigin(tinkUrl);

  const handlePaymentRequestId = useCallback(
    (paymentRequestId: string) => {
      console.log('[useTinkLink] Tink returned payment_request_id:', paymentRequestId);
      navigate(`/callback?payment_request_id=${paymentRequestId}&mode=${mode}`);
    },
    [navigate, mode]
  );

  const handleError = useCallback(
    ({ status, message, reason, providerName }: TinkErrorPayload) => {
      console.error(`[useTinkLink] Tink error — status: ${status}, message: ${message}`, { reason, providerName });

      if (status === 'USER_CANCELLED') {
        console.log('[useTinkLink] User cancelled the Tink journey');
        if (onCancelled) {
          onCancelled(message, reason, providerName);
        } else {
          const label = providerName ? ` at ${providerName}` : '';
          setError(`Payment cancelled${label}${reason ? ': ' + reason : ''}`);
        }
        return;
      }

      if (onError) {
        onError(status, message);
      } else {
        setError(`Payment failed: ${message} (${status})`);
      }
    },
    [onError, onCancelled, setError]
  );

  const handleStatus = useCallback(
    (loading: boolean) => {
      console.log(`[useTinkLink] Tink loading overlay: ${loading ? 'shown' : 'hidden'}`);
      if (onStatus) {
        onStatus(loading);
      } else {
        if (loading) setStatus('verifying');
      }
    },
    [onStatus, setStatus]
  );

  const handleApplicationEvent = useCallback((data: unknown) => {
    const event = (data as { event?: string })?.event;
    console.log('[useTinkLink] Received application-event from Tink:', event, data);

    if (event === 'AUTHENTICATION_SUCCESSFUL') {
      // User has authenticated with their bank — advance stepper to "Authorize" (step 2)
      setStep(2 as PaymentStep);
    }
  }, [setStep]);

  useEffect(() => {
    function receiveMessage(event: MessageEvent) {
      // Strict origin check — only accept messages from Tink Link
      if (event.origin !== tinkOrigin) return;

      let parsed: {
        type: string;
        data?: unknown;
        error?: TinkErrorPayload;
      };

      try {
        parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        console.warn('[useTinkLink] Failed to parse postMessage:', event.data);
        return;
      }

      console.log('[useTinkLink] Received Tink message:', parsed);

      switch (parsed.type) {
        case 'payment_request_id':
          // Tink signals payment completion with the payment_request_id
          handlePaymentRequestId(parsed.data as string);
          break;

        case 'code':
          // 'code' is used in account check flows — not applicable here, ignore
          console.log('[useTinkLink] Received code (ignored in payment flow):', parsed.data);
          break;

        case 'error':
          handleError(parsed.error!);
          break;

        case 'credentials':
          // Auth failure with credentials — treat as error
          handleError(parsed.error!);
          break;

        case 'status':
          handleStatus((parsed.data as { loading: boolean }).loading);
          break;

        case 'application-event':
            handleApplicationEvent(parsed.data);
            break;

        default:
          // Tink may add new message types in future — safe to ignore
          console.log('[useTinkLink] Unknown message type (ignored):', parsed.type);
      }
    }

    window.addEventListener('message', receiveMessage, false);
    return () => window.removeEventListener('message', receiveMessage);
  }, [tinkOrigin, handlePaymentRequestId, handleError, handleStatus, handleApplicationEvent]);
}
