import { useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, ChevronRight } from 'lucide-react';
import { createPaymentRequest, getLinkUrl, saveSession } from '@/api/tinkApi';
import { Card } from '@/components/ui/index';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StepIndicator } from '@/components/StepIndicator';
import { TinkIframe } from '@/components/TinkIframe';
import { usePaymentStore } from '@/store/paymentStore';
import type { PaymentMode } from '@/store/paymentStore';
import { config } from '@/lib/config';
import { Badge } from '@/components/ui/index';
import { usePpbChannel } from '@/hooks/usePpbChannel';

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
  const {
    mode, status, tinkLinkUrl, step,
    setMode, setReturnUrl, setTinkLinkUrl, setPaymentRequestId, setStatus, setError,
  } = usePaymentStore();

  const { sendCancelled, isInsideIframe } = usePpbChannel();

  // Dev panel state — only used in redirect mode for testing return URLs
  const [devReturnUrl, setDevReturnUrl] = useState('');
  const [devPanelReady, setDevPanelReady] = useState(false); // true = show panel, false = auto-start

  const handleCancelled = useCallback(
    (message: string, reason?: string, providerName?: string) => {
      console.log('[Landing] Tink journey cancelled by user', { message, reason, providerName });
      const label = providerName ? ` at ${providerName}` : '';
      const displayMsg = `Payment cancelled${label}${reason ? ': ' + reason : ''}`;
      setError(displayMsg);
      if (isInsideIframe) {
        sendCancelled(message, reason, providerName);
      }
    },
    [setError, sendCancelled, isInsideIframe]
  );

  async function initPayment(returnUrlOverride?: string) {
    const modeParam = mode;
    const returnUrlParam = returnUrlOverride
      || localStorage.getItem('ppb_return_url')
      || config.merchantAppUrl;

    setStatus('loading');

    // Persist chosen returnUrl for the /callback/tink page (survives Tink redirect)
    localStorage.setItem('ppb_return_url', returnUrlParam);
    sessionStorage.setItem('ppb_return_url', returnUrlParam);

    const redirectUri = `${config.ppbAppUrl}/callback/tink`;

    try {
      const paymentResp = await createPaymentRequest({
        recipient: { accountNumber: 'DE89370400440532013000', accountType: 'iban' },
        amount: 114.96,
        currency: 'EUR',
        market: 'DE',
        recipientName: 'ShopDemo Store',
        sourceMessage: 'ShopDemo Order #' + Date.now(),
        remittanceInformation: { type: 'UNSTRUCTURED', value: 'ShopDemo purchase' },
        paymentScheme: 'SEPA_CREDIT_TRANSFER',
      });

      setPaymentRequestId(paymentResp.id);

      // Save session on backend so cross-browser flows (Chrome) can retrieve returnUrl
      await saveSession(paymentResp.id, returnUrlParam, modeParam);

      const linkResp = await getLinkUrl(paymentResp.id, redirectUri);
      const tinkUrl =
        modeParam === 'iframe'  ? `${linkResp.linkUrl}&iframe=true` :
        modeParam === 'hybrid'  ? `${linkResp.linkUrl}&iframe=true&iframe_behaviour=PARENT_REDIRECT` :
        linkResp.linkUrl;
      setTinkLinkUrl(tinkUrl);

      if (modeParam === 'redirect') {
        window.location.href = tinkUrl;
      } else {
        setStatus('ready');
      }
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      console.error('[Landing] Failed to initialise payment:', err);
      setError(axiosErr?.response?.data?.error || 'Failed to create payment session');
    }
  }

  useEffect(() => {
    const modeParam = (params.get('mode') || 'iframe') as PaymentMode;
    const returnUrlParam = params.get('returnUrl') || config.merchantAppUrl;
    const isIframe = params.get('iframe') === 'true';

    setMode(modeParam);
    setReturnUrl(returnUrlParam);
    setDevReturnUrl(returnUrlParam);

    localStorage.setItem('ppb_return_url', returnUrlParam);
    localStorage.setItem('ppb_mode', modeParam);
    localStorage.setItem('ppb_iframe', String(isIframe));
    sessionStorage.setItem('ppb_return_url', returnUrlParam);
    sessionStorage.setItem('ppb_mode', modeParam);
    sessionStorage.setItem('ppb_iframe', String(isIframe));

    if (modeParam === 'redirect') {
      // Show dev panel first so tester can choose the return URL
      setDevPanelReady(true);
    } else {
      // iframe / hybrid — auto-start immediately
      initPayment(returnUrlParam);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-defined test return URL options
  const TEST_URLS = [
    {
      label: 'Deep Link',
      sublabel: 'merchantcheckout://',
      value: 'merchantcheckout://payment/success',
      color: 'bg-violet-50 border-violet-200 text-violet-700',
      dot: 'bg-violet-500',
    },
    {
      label: 'Universal Link',
      sublabel: 'https://',
      value: 'https://example.com/payment/success',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      dot: 'bg-blue-500',
    },
    {
      label: 'Web App',
      sublabel: 'localhost / LAN',
      value: `${config.merchantAppUrl}/success`,
      color: 'bg-slate-50 border-slate-200 text-slate-700',
      dot: 'bg-slate-400',
    },
  ];

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
        <StepIndicator currentStep={step} />

        {/* Dev Panel — redirect mode only, shown before payment starts */}
        {devPanelReady && status === 'idle' && (
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Dev / Test</span>
              <span className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">Choose return URL</span>
            </div>

            <div className="space-y-2 mb-4">
              {TEST_URLS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDevReturnUrl(opt.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    devReturnUrl === opt.value
                      ? opt.color + ' ring-2 ring-offset-1 ring-current'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${devReturnUrl === opt.value ? opt.dot : 'bg-slate-300'}`} />
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">{opt.label}</span>
                    <span className="text-xs opacity-60 truncate block">{opt.value}</span>
                  </span>
                  {devReturnUrl === opt.value && <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-60" />}
                </button>
              ))}
            </div>

            {/* Custom URL input */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 font-medium block mb-1">Custom URL</label>
              <input
                type="text"
                value={devReturnUrl}
                onChange={(e) => setDevReturnUrl(e.target.value)}
                placeholder="merchantcheckout://... or https://..."
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              />
            </div>

            <button
              onClick={() => initPayment(devReturnUrl)}
              disabled={!devReturnUrl}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Start Payment →
            </button>
          </Card>
        )}

        {status === 'loading' && (
          <Card className="text-center">
            <LoadingSpinner message="Setting up your payment..." size="md" />
          </Card>
        )}

        {status === 'ready' && tinkLinkUrl && (
          <TinkIframe url={tinkLinkUrl} mode={mode} onCancelled={handleCancelled} />
        )}
      </div>
    </div>
  );
}
