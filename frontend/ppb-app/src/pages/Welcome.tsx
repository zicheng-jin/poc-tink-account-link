import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Welcome() {
  const navigate = useNavigate();

  const handleClose = () => {
    window.history.back();
  };

  const handleConnectInstantly = () => {
    navigate('/');
  };

  return (
    /*
     * h-[100dvh] uses the *dynamic* viewport height unit (dvh).
     * Unlike vh, dvh shrinks when the mobile browser UI (URL bar, nav bar)
     * is visible, so the page always fits exactly within the visible area
     * and the footer is never hidden behind browser chrome.
     */
    <div className="flex flex-col h-[100dvh] bg-white">

      {/* ── Scrollable main content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">

        {/* Close button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Welcome to Pay by Bank
        </h1>

        {/* Intro paragraph */}
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#1a7a8a' }}>
          Connect instantly to thousands of financial institutions. Search, select and authenticate
          securely and seamlessly.
        </p>

        {/* Why section */}
        <p className="text-sm font-bold text-slate-900 mb-3">Why connect instantly?</p>
        <ul className="text-sm space-y-1.5 mb-8 list-disc pl-5">
          <li className="text-slate-800">Fast account linking</li>
          <li className="text-slate-800">Safe and secure</li>
          <li style={{ color: '#1a7a8a' }}>Majority of banks and credit unions supported</li>
        </ul>

        {/* Primary CTA */}
        <button
          onClick={handleConnectInstantly}
          className="w-full py-4 text-white font-bold tracking-widest text-sm uppercase rounded-md transition-colors"
          style={{ backgroundColor: '#1a7a8a' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#156878')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a7a8a')}
        >
          Connect Instantly
        </button>
      </div>

      {/* ── Sticky footer ───────────────────────────────────────────────────
           paddingBottom uses max() so it is at least 1rem but grows to cover
           the iOS home indicator (env(safe-area-inset-bottom)) when present.
           This prevents the footer text from being hidden behind the home bar.
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 pt-4 text-center"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <p className="text-xs leading-relaxed mb-2" style={{ color: '#1a7a8a' }}>
          Manually connect with your account and routing numbers when instant connection is
          unavailable. Manual connection may take several days to complete.
        </p>
        <button
          className="text-xs font-medium underline text-slate-900 hover:text-slate-600 transition-colors"
        >
          Connect manually
        </button>
      </div>
    </div>
  );
}
