import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Separator } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ModeSelector } from '@/components/ModeSelector';
import { PayByBankButton } from '@/components/PayByBankButton';
import { SuccessBanner } from '@/components/SuccessBanner';
import { IframeOverlay } from '@/components/IframeOverlay';
import { useCheckoutStore } from '@/store/checkoutStore';
import { config } from '@/lib/config';

const cartItems = [
  { name: 'Wireless Headphones', qty: 1, price: 79.99 },
  { name: 'USB-C Cable (2m)', qty: 2, price: 9.99 },
  { name: 'Phone Stand', qty: 1, price: 14.99 },
];

const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
const tax = subtotal * 0.19;
const total = subtotal + tax;

export function Checkout() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { mode, setMode, paymentStatus, paymentRequestId, iframeOpen, closeIframe, errorMessage, setError, setPaymentStatus } =
    useCheckoutStore();

  // Hybrid mode: Tink redirected window.top back to /checkout with ppb_status params.
  // Read them once on mount, restore error state, then clean the URL.
  useEffect(() => {
    const ppbStatus = searchParams.get('ppb_status');
    if (!ppbStatus) return;
    const rawMsg = searchParams.get('ppb_message');
    const errorReason = searchParams.get('ppb_error_reason');
    const displayMsg = rawMsg
      ? decodeURIComponent(rawMsg)
      : (errorReason ?? (ppbStatus === 'cancelled' ? 'You cancelled the payment.' : 'Payment failed.'));
    setError(displayMsg);
    setPaymentStatus('error');
    // Remove ppb_* params from URL without re-rendering
    setSearchParams((prev) => {
      prev.delete('ppb_status');
      prev.delete('ppb_error');
      prev.delete('ppb_error_reason');
      prev.delete('ppb_message');
      prev.delete('payment_request_id');
      prev.delete('tracking_id');
      return prev;
    }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ppbUrl = `${config.ppbAppUrl}/?mode=${mode}&returnUrl=${encodeURIComponent(`${config.merchantAppUrl}/success`)}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-bold text-slate-900">ShopDemo</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.qty}</p>
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        €{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>VAT (19%)</span>
                    <span>€{tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>Total</span>
                    <span className="text-lg">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500 space-y-1">
                  <p className="font-medium text-slate-800">John Demo</p>
                  <p>Unter den Linden 1</p>
                  <p>10117 Berlin, Germany</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <ModeSelector value={mode} onChange={setMode} />

                <Separator />

                {paymentStatus === 'success' ? (
                  <SuccessBanner paymentRequestId={paymentRequestId} />
                ) : paymentStatus === 'error' ? (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                    {errorMessage || 'Payment failed. Please try again.'}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => useCheckoutStore.getState().reset()}
                    >
                      Try again
                    </Button>
                  </div>
                ) : (
                  <PayByBankButton />
                )}

                <p className="text-xs text-slate-400 text-center mt-3">
                  Secured by{' '}
                  <span className="font-semibold text-slate-500">Tink</span>
                  {' '}· PSD2 Open Banking
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* IframeOverlay — only for iframe/hybrid modes */}
      {iframeOpen && (
        <IframeOverlay url={ppbUrl} onClose={closeIframe} />
      )}
    </div>
  );
}
