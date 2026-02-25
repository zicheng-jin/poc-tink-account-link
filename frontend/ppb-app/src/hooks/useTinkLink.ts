import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentStore } from '@/store/paymentStore';
import type { PaymentStep } from '@/store/paymentStore';

interface UseTinkLinkOptions {
  tinkUrl: string;
  mode: string;
  onCode?: (code: string) => void;
  onError?: (status: string, message: string) => void;
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

export function useTinkLink({ tinkUrl, mode, onCode, onError, onStatus }: UseTinkLinkOptions) {
  const navigate = useNavigate();
  const { setError, setStatus, setStep } = usePaymentStore();

  const tinkOrigin = getTinkOrigin(tinkUrl);

  const handleCode = useCallback(
    (code: string) => {
      console.log('[useTinkLink] Tink returned code:', code);
      if (onCode) {
        onCode(code);
      } else {
        navigate(`/callback?code=${code}&mode=${mode}`);
      }
    },
    [onCode, navigate, mode]
  );

  const handleError = useCallback(
    (status: string, message: string) => {
      console.error(`[useTinkLink] Tink error — status: ${status}, message: ${message}`);
      if (onError) {
        onError(status, message);
      } else {
        setError(`Payment failed: ${message} (${status})`);
      }
    },
    [onError, setError]
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
        error?: { status: string; message: string };
      };

      try {
        parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        console.warn('[useTinkLink] Failed to parse postMessage:', event.data);
        return;
      }

      console.log('[useTinkLink] Received Tink message:', parsed);

      switch (parsed.type) {
        case 'code':
          handleCode(parsed.data as string);
          break;

        case 'error':
          handleError(parsed.error!.status, parsed.error!.message);
          break;

        case 'credentials':
          // Auth failure with credentials — treat as error
          handleError(parsed.error!.status, parsed.error!.message);
          break;

        case 'status':
          handleStatus((parsed.data as { loading: boolean }).loading);
          break;

        case 'payment_request_id':
          // Not used in this demo, but could be helpful for correlating events to payment requests in a real app
          console.log('[useTinkLink] Payment Request ID:', parsed.data);
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
  }, [tinkOrigin, handleCode, handleError, handleStatus, handleApplicationEvent]);
}
