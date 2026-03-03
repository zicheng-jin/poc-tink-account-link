import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Card';
import confetti from 'canvas-confetti';

export function Success() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const paymentRequestId = params.get('payment_request_id');
  const status = params.get('status');

  useEffect(() => {
    if (status === 'success') {
      // Fire confetti once on mount
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#2563EB', '#16a34a', '#f59e0b', '#8b5cf6'],
      });
    }
  }, [status]);

  if (status === 'cancelled') {
    const rawMsg = params.get('message');
    const errorReason = params.get('error_reason');
    const displayMsg = rawMsg ? decodeURIComponent(rawMsg) : (errorReason ?? 'You cancelled the payment.');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Cancelled</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{displayMsg}</p>
          <Button className="w-full" onClick={() => navigate('/checkout')}>
            Back to checkout
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    const rawMsg = params.get('message');
    const errorReason = params.get('error_reason');
    const displayMsg = rawMsg ? decodeURIComponent(rawMsg) : (errorReason ?? 'An unexpected error occurred.');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{displayMsg}</p>
          <Button className="w-full" onClick={() => navigate('/checkout')}>
            Back to checkout
          </Button>
        </div>
      </div>
    );
  }

  if (status !== 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <p className="text-slate-500">Invalid success page state.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/checkout')}>
            Back to checkout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="font-bold text-slate-900">ShopDemo</span>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="glass-card p-8 text-center animate-fade-in">
          {/* Success icon */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Payment Authorized!
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Your bank account has been successfully linked and your order is confirmed.
            You'll receive a confirmation email shortly.
          </p>

          {paymentRequestId && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Payment Request ID
              </p>
              <Badge variant="outline" className="font-mono text-xs break-all">
                {paymentRequestId}
              </Badge>
            </div>
          )}

          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
            <Button
              variant="ghost"
              className="w-full gap-1.5"
              onClick={() => navigate('/checkout')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
