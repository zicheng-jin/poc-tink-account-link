import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Shield, Zap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Card';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">ShopDemo</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          Pay by Bank POC
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
          Demo Merchant<br />
          <span className="text-blue-600">Checkout Experience</span>
        </h1>
        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
          Test Tink Pay by Bank integration in three modes: full iframe, full redirect, and hybrid.
        </p>

        <Button size="lg" onClick={() => navigate('/checkout')} className="gap-2">
          <ShoppingBag className="w-5 h-5" />
          Go to Checkout
        </Button>

        {/* Feature badges */}
        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Zap className="w-4 h-4 text-blue-500" />
            Fast checkout
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Shield className="w-4 h-4 text-green-500" />
            Secure payments
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Building2 className="w-4 h-4 text-violet-500" />
            Pay by Bank
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              mode: 'Iframe',
              badge: 'blue' as const,
              desc: 'Entire flow stays on-page. App B opens in a drawer, Tink loads inside a nested iframe. Messages via postMessage.',
            },
            {
              mode: 'Redirect',
              badge: 'amber' as const,
              desc: 'Full-page navigation: Merchant → PPB App → Tink → Bank → PPB App callback → Merchant success page.',
            },
            {
              mode: 'Hybrid',
              badge: 'violet' as const,
              desc: 'Tink bank selection in iframe. After bank chosen, breaks out to full-page redirect for bank auth, then returns.',
            },
          ].map((item) => (
            <div key={item.mode} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={item.badge}>{item.mode} Mode</Badge>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
