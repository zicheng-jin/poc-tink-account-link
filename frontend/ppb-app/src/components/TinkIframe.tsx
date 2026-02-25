import { useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/index';
import { useTinkLink } from '@/hooks/useTinkLink';

interface TinkIframeProps {
  url: string;
  mode: 'iframe' | 'redirect' | 'hybrid';
}

export function TinkIframe({ url, mode }: TinkIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [tinkLoading, setTinkLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useTinkLink({
    tinkUrl: url,
    mode,
    onStatus: (loading) => setTinkLoading(loading),
  });

  return (
    <div className="w-full flex flex-col">
      {/* Branded loading bar at top */}
      <div className="relative h-1 bg-slate-100 rounded-full overflow-hidden mb-3">
        {(isLoading || tinkLoading) && (
          <div className="absolute inset-y-0 left-0 bg-blue-600 rounded-full animate-progress" />
        )}
        {!isLoading && !tinkLoading && (
          <div className="absolute inset-y-0 left-0 right-0 bg-blue-600 rounded-full" />
        )}
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
          onLoad={() => setIsLoading(false)}
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
