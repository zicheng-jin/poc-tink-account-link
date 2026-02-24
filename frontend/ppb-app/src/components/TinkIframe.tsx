import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/index';

interface TinkIframeProps {
  url: string;
  mode: 'iframe' | 'redirect' | 'hybrid';
}

export function TinkIframe({ url, mode }: TinkIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

  function handleLoad() {
    setIsLoading(false);
  }

  // For hybrid mode, Tink will navigate window.top to the bank URL,
  // which means the whole window navigates away. When it returns from
  // the bank auth flow, it comes back to /callback (the redirect_uri).
  // No special handling needed here — it just works via the redirect_uri.

  // For iframe mode, Tink fires a postMessage on completion.
  // We handle that by listening for a redirect to the callback URL
  // (Tink navigates the iframe's top frame in some flows).

  // Add note: Tink's actual postMessage event keys vary — update based
  // on your Tink Console app configuration and their SDK documentation.
  function handleIframeNavigation(e: React.SyntheticEvent<HTMLIFrameElement>) {
    // When Tink navigates within the iframe to our callback URL (iframe mode),
    // the iframe src changes to include payment_request_id.
    // We intercept by watching for the callback URL pattern.
    try {
      const iframe = e.currentTarget;
      const iframeSrc = iframe.src;
      if (iframeSrc.includes('/callback') && iframeSrc.includes('payment_request_id')) {
        const url = new URL(iframeSrc);
        const paymentRequestId = url.searchParams.get('payment_request_id');
        if (paymentRequestId) {
          navigate(`/callback?payment_request_id=${paymentRequestId}&mode=${mode}`);
        }
      }
    } catch {
      // Cross-origin iframe — can't read src, that's fine
    }
  }

  return (
    <div className="w-full flex flex-col">
      {/* Branded loading bar at top */}
      <div className="relative h-1 bg-slate-100 rounded-full overflow-hidden mb-3">
        {isLoading && (
          <div className="absolute inset-y-0 left-0 bg-blue-600 rounded-full animate-progress" />
        )}
        {!isLoading && <div className="absolute inset-y-0 left-0 right-0 bg-blue-600 rounded-full" />}
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border border-slate-200" style={{ minHeight: 580 }}>
        {/* Skeleton shown while loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-white z-10 p-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="pt-4 space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          title="Tink Pay by Bank"
          className="w-full border-0"
          style={{ height: 580 }}
          onLoad={handleLoad}
          onLoadCapture={handleIframeNavigation}
          allow="payment"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        />
      </div>

      <p className="text-center text-xs text-slate-400 mt-3">
        Powered by <span className="font-semibold text-slate-500">Tink</span> · PSD2 Open Banking
      </p>
    </div>
  );
}
