import { Building2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useCheckoutStore } from '@/store/checkoutStore';
import { config } from '@/lib/config';

export function PayByBankButton() {
  const { mode, paymentStatus, openIframe, setPaymentStatus } = useCheckoutStore();

  const isPending = paymentStatus === 'pending';

  function buildPpbUrl() {
    const returnUrl = encodeURIComponent(`${config.merchantAppUrl}/success`);
    return `${config.ppbAppUrl}/?mode=${mode}&returnUrl=${returnUrl}`;
  }

  function handleClick() {
    if (mode === 'redirect') {
      setPaymentStatus('pending');
      window.location.href = buildPpbUrl();
    } else {
      // iframe or hybrid — open the drawer
      openIframe();
    }
  }

  return (
    <Button
      size="lg"
      className="w-full"
      loading={isPending}
      onClick={handleClick}
    >
      {!isPending && <Building2 className="w-5 h-5" />}
      Pay by Bank
    </Button>
  );
}
