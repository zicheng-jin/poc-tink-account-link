import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { createPaymentRequest, getLinkUrl } from '@/api/tinkApi';
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
  const {
    mode, status, tinkLinkUrl, step,
    setMode, setReturnUrl, setTinkLinkUrl, setPaymentRequestId, setStatus, setError,
  } = usePaymentStore();

  useEffect(() => {
    const modeParam = (params.get('mode') || 'iframe') as PaymentMode;
    const returnUrlParam = params.get('returnUrl') || config.merchantAppUrl;
    const isIframe = params.get('iframe') === 'true';

    setMode(modeParam);
    setReturnUrl(returnUrlParam);

    // Persist for the /callback page (survives Tink redirect)
    sessionStorage.setItem('ppb_return_url', returnUrlParam);
    sessionStorage.setItem('ppb_mode', modeParam);
    sessionStorage.setItem('ppb_iframe', String(isIframe));

    setStatus('loading');

    const redirectUri = `${config.ppbAppUrl}/callback`;

    async function initPayment() {
      try {
        // Step 1 — create a Tink payment request
        const paymentResp = await createPaymentRequest({
          recipient: {
            accountNumber: 'DE89370400440532013000',
            accountType: 'iban',
          },
          amount: 114.96,
          currency: 'EUR',
          market: 'DE',
          recipientName: 'ShopDemo Store',
          sourceMessage: 'ShopDemo Order #' + Date.now(),
          remittanceInformation: {
            type: 'UNSTRUCTURED',
            value: 'ShopDemo purchase',
          },
          paymentScheme: 'SEPA_CREDIT_TRANSFER',
  //         "amount": 10,
  // "currency": "GBP",
  // "destinations": [
  //   {
  //     "accountNumber": "18500837110008",
  //     "type": "sort-code"
  //   }
  // ],
  // "market": "GB",
  // "merchantId": "aea2d17c-590a-43b8-a066-c88a271966a8",
  // "metadata": {
  //   "custom key": "custom value",
  //   "merchantReference": "17172137"
  // },
  // "paymentScheme": "FASTER_PAYMENTS",
  // "recipient": {
  //   "accountNumber": "18500837110001",
  //   "accountType": "sort-code",
  //   "businessIdentifierCode": "string"
  // },
  // "recipientName": "Test AB",
  // "remittanceInformation": {
  //   "type": "UNSTRUCTURED",
  //   "value": "string"
  // },
  // "sender": {
  //   "accountNumber": "18500837110001",
  //   "accountType": "sort-code",
  //   "firstName": "string",
  //   "lastName": "string"
  // },
  // "creditor": {
  //   "accountNumber": "18500837110001",
  //   "accountType": "sort-code",
  //   "firstName": "string",
  //   "lastName": "string"
  // },
  // "sourceMessage": "Gym Equipment"
        });

        setPaymentRequestId(paymentResp.id);

        // Step 2 — get the Tink Link URL
        const linkResp = await getLinkUrl(paymentResp.id, redirectUri);
        const tinkUrl =
          modeParam === 'iframe'   ? `${linkResp.linkUrl}&iframe=true` :
          modeParam === 'hybrid'   ? `${linkResp.linkUrl}&iframe=true&iframe_behaviour=PARENT_REDIRECT` :
          linkResp.linkUrl; // redirect — no extra params
        setTinkLinkUrl(tinkUrl);

        if (modeParam === 'redirect') {
          // Full redirect — navigate the whole page to Tink
          window.location.href = tinkUrl;
        } else {
          // iframe or hybrid — render TinkIframe
          setStatus('ready');
        }
      } catch (err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        console.error('[Landing] Failed to initialise payment:', err);
        setError(axiosErr?.response?.data?.error || 'Failed to create payment session');
      }
    }

    initPayment();
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
        <StepIndicator currentStep={step} />

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
