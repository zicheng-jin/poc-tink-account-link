import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Building2 } from 'lucide-react';
import { Card } from '@/components/ui/index';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StepIndicator } from '@/components/StepIndicator';
import { TinkIframe } from '@/components/TinkIframe';
import { usePaymentStore } from '@/store/paymentStore';
import type { PaymentMode } from '@/store/paymentStore';
import { config } from '@/lib/config';
import { Badge } from '@/components/ui/index';

const modeLabel: Record<PaymentMode, string> = {
  iframe: 'Iframe Mode',
  redirect: 'Redirect Mode',
  hybrid: 'Hybrid Mode',
};

const modeBadge: Record<PaymentMode, 'blue' | 'amber' | 'violet'> = {
  iframe: 'blue',
  redirect: 'amber',
  hybrid: 'violet',
};

export function Landing() {
  const [params] = useSearchParams();
  const { mode, status, tinkLinkUrl, setMode, setReturnUrl, setTinkLinkUrl, setStatus, setError } =
    usePaymentStore();

  useEffect(() => {
    const modeParam = (params.get('mode') || 'iframe') as PaymentMode;
    const returnUrlParam = params.get('returnUrl') || config.merchantAppUrl;

    setMode(modeParam);
    setReturnUrl(returnUrlParam);

    // Store returnUrl in sessionStorage for the callback page
    sessionStorage.setItem('ppb_return_url', returnUrlParam);
    sessionStorage.setItem('ppb_mode', modeParam);

    setStatus('loading');

    const callbackUrl = `${config.ppbAppUrl}/callback`;

    axios
      .post(`${config.backendUrl}/api/payment-link`, {
        mode: modeParam,
        callbackUrl,
        amount: 114.96,
        currency: 'EUR',
      })
      .then((res) => {
        const { tinkLinkUrl: tinkUrl } = res.data;
        setTinkLinkUrl(tinkUrl);

        if (modeParam === 'redirect') {
          // Full redirect — navigate the whole page to Tink
          window.location.href = tinkUrl;
        } else {
          // iframe or hybrid — show the TinkIframe component
          setStatus('ready');
        }
      })
      .catch((err) => {
        console.error('[Landing] Failed to get payment link:', err);
        setError(err?.response?.data?.error || 'Failed to create payment session');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 mb-4">
            {usePaymentStore.getState().errorMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Try again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Pay by Bank</span>
          </div>
          <Badge variant={modeBadge[mode]}>{modeLabel[mode]}</Badge>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <StepIndicator currentStep={status === 'ready' ? 1 : 1} />

        {status === 'loading' && (
          <Card className="text-center">
            <LoadingSpinner message="Setting up your payment..." size="md" />
          </Card>
        )}

        {status === 'ready' && tinkLinkUrl && (
          <TinkIframe url={tinkLinkUrl} mode={mode} />
        )}
      </div>
    </div>
  );
}
