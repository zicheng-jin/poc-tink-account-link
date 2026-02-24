import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StepIndicator } from '@/components/StepIndicator';
import { Badge, Card } from '@/components/ui/index';
import { config } from '@/lib/config';
import type { PaymentMode } from '@/store/paymentStore';

type CallbackStatus = 'verifying' | 'success' | 'error';

export function Callback() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paymentRequestId = params.get('payment_request_id');
  const modeParam = (params.get('mode') ||
    sessionStorage.getItem('ppb_mode') ||
    'redirect') as PaymentMode;
  const returnUrl =
    params.get('returnUrl') ||
    sessionStorage.getItem('ppb_return_url') ||
    config.merchantAppUrl;

  useEffect(() => {
    if (!paymentRequestId) {
      setStatus('error');
      setErrorMessage('No payment_request_id found in the callback URL.');
      return;
    }

    // Call backend to mock account verification
    axios
      .post(`${config.backendUrl}/api/verify-payment`, { paymentRequestId })
      .then(() => {
        setStatus('success');

        // After 1.5s of showing success, complete the flow
        setTimeout(() => {
          completeFlow();
        }, 1500);
      })
      .catch((err) => {
        console.error('[Callback] Verification failed:', err);
        setStatus('error');
        setErrorMessage(err?.response?.data?.error || 'Account verification failed.');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function completeFlow() {
    const successUrl = `${returnUrl}?status=success&payment_request_id=${paymentRequestId}`;

    if (modeParam === 'redirect') {
      // Full redirect — navigate merchant app with success params
      window.location.href = successUrl;
    } else {
      // iframe or hybrid — postMessage to parent/top with explicit origin
      const merchantOrigin = new URL(returnUrl).origin;
      const message = {
        type: 'PPB_SUCCESS',
        paymentRequestId,
      };

      try {
        // window.top handles both iframe (nested) and hybrid (may be top by now)
        window.top?.postMessage(message, merchantOrigin);
      } catch (e) {
        // Fallback to parent if top throws (e.g. cross-origin restriction in some browsers)
        window.parent?.postMessage(message, merchantOrigin);
      }
    }
  }

  const modeLabels: Record<PaymentMode, string> = {
    iframe: 'Iframe Mode',
    redirect: 'Redirect Mode',
    hybrid: 'Hybrid Mode',
  };
  const modeBadge: Record<PaymentMode, 'blue' | 'amber' | 'violet'> = {
    iframe: 'blue',
    redirect: 'amber',
    hybrid: 'violet',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-bold text-slate-900">Pay by Bank</span>
          <Badge variant={modeBadge[modeParam]}>{modeLabels[modeParam]}</Badge>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-8">
        <StepIndicator currentStep={status === 'success' ? 3 : 2} />

        <Card className="text-center">
          {status === 'verifying' && (
            <LoadingSpinner message="Verifying your account..." size="md" />
          )}

          {status === 'success' && (
            <div className="py-6 animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center animate-scale-in">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Verification Successful
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Redirecting you back to the merchant...
              </p>
              {paymentRequestId && (
                <div className="bg-slate-50 rounded-lg p-3 text-left">
                  <p className="text-xs text-slate-400 mb-1">Payment Request ID</p>
                  <p className="text-xs font-mono text-slate-600 break-all">{paymentRequestId}</p>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="py-6 animate-fade-in">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Verification Failed</h2>
              <p className="text-sm text-slate-500 mb-4">{errorMessage}</p>
              <button
                onClick={() => window.history.back()}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Go back
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
