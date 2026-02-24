import { Router, Request, Response } from 'express';
import {
  getClientAccessToken,
  createPaymentRequest,
  buildTinkLinkUrl,
} from '../services/tinkService';

const router = Router();

interface PaymentLinkBody {
  mode: 'iframe' | 'redirect' | 'hybrid';
  callbackUrl: string; // App B's /callback URL (the Tink redirect_uri)
  amount?: number;
  currency?: string;
}

router.post('/payment-link', async (req: Request, res: Response): Promise<void> => {
  const {
    mode,
    callbackUrl,
    amount = 1.00,
    currency = 'EUR',
  } = req.body as PaymentLinkBody;

  if (!mode || !callbackUrl) {
    res.status(400).json({ error: 'mode and callbackUrl are required' });
    return;
  }

  // Validate callbackUrl is from the expected PPB app domain
  const ppbAppUrl = process.env.PPB_APP_URL || 'http://localhost:5174';
  if (!callbackUrl.startsWith(ppbAppUrl)) {
    res.status(400).json({ error: 'callbackUrl must be on the PPB app domain' });
    return;
  }

  try {
    const accessToken = await getClientAccessToken();

    const paymentRequestId = await createPaymentRequest(
      accessToken,
      amount,
      currency,
      'DE89370400440532013000', // Demo IBAN
      'ShopDemo Store',
      'ShopDemo Order #' + Date.now()
    );

    const tinkLinkUrl = buildTinkLinkUrl(paymentRequestId, callbackUrl);

    res.json({
      tinkLinkUrl,
      paymentRequestId,
      mode,
    });
  } catch (err) {
    const error = err as Error;
    console.error('[payment-link] Error:', error.message);
    res.status(500).json({
      error: 'Failed to create payment link',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
