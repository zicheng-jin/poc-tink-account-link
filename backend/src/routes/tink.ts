import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const TINK_API_URL = process.env.TINK_API_URL || 'https://api.tink.com';
const TINK_LINK_URL = process.env.TINK_LINK_URL || 'https://link.tink.com';
const CLIENT_ID = process.env.TINK_CLIENT_ID || '';
const CLIENT_SECRET = process.env.TINK_CLIENT_SECRET || '';

// ---------------------------------------------------------------------------
// POST /api/tink/token
// Fetches a client_credentials access token from Tink using env credentials.
// ---------------------------------------------------------------------------
router.post('/tink/token', async (_req: Request, res: Response): Promise<void> => {
  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'payment:read,payment:write',
    });

    const response = await axios.post(
      `${TINK_API_URL}/api/v1/oauth/token`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json(response.data);
  } catch (err) {
    const error = err as Error;
    console.error('[tink/token] Error:', error.message);
    const axiosError = err as { response?: { status?: number; data?: unknown } };
    res.status(axiosError.response?.status || 500).json({
      error: 'Failed to fetch Tink token',
      details: axiosError.response?.data || error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/tink/payment-request
// Creates a payment request on Tink. Acquires a fresh token automatically.
// Body mirrors Tink's API shape:
// {
//   recipient: { accountNumber: string, accountType: string },
//   amount: number,
//   currency: string,
//   market: string,
//   recipientName: string,
//   sourceMessage: string,
//   remittanceInformation: { type: string, value: string },
//   paymentScheme: string
// }
// ---------------------------------------------------------------------------
router.post('/tink/payment-request', async (req: Request, res: Response): Promise<void> => {
  const {
    recipient,
    amount,
    currency = 'EUR',
    market = 'DE',
    recipientName,
    sourceMessage,
    remittanceInformation,
    paymentScheme = 'SEPA_CREDIT_TRANSFER',
  } = req.body;

  if (!recipient?.accountNumber || amount == null) {
    res.status(400).json({ error: '`recipient.accountNumber` and `amount` are required' });
    return;
  }

  try {
    // Step 1 – get a fresh access token
    const tokenParams = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'payment:read,payment:write',
    });

    const tokenResp = await axios.post<{ access_token: string }>(
      `${TINK_API_URL}/api/v1/oauth/token`,
      tokenParams.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log('[tink/payment-request] Obtained access token', tokenResp);
    const accessToken = tokenResp.data.access_token;

    // Step 2 – create payment request
    const paymentBody = {
      recipient: {
        accountNumber: recipient.accountNumber,
        accountType: recipient.accountType || 'iban',
      },
      amount,
      currency,
      market,
      recipientName: recipientName || 'Merchant',
      sourceMessage: sourceMessage || 'Payment',
      remittanceInformation: remittanceInformation || {
        type: 'UNSTRUCTURED',
        value: sourceMessage || 'Payment',
      },
      paymentScheme,
    };

    const paymentResp = await axios.post(
      `${TINK_API_URL}/api/v1/payments/requests`,
      paymentBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(paymentResp.data);
  } catch (err) {
    const error = err as Error;
    console.error('[tink/payment-request] Error:', error.message);
    const axiosError = err as { response?: { status?: number; data?: unknown } };
    res.status(axiosError.response?.status || 500).json({
      error: 'Failed to create payment request',
      details: axiosError.response?.data || error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/tink/link-url?payment_request_id=xxx&redirect_uri=xxx
// Builds and returns the Tink Payment Link URL.
// ---------------------------------------------------------------------------
router.get('/tink/link-url', (req: Request, res: Response): void => {
  const { payment_request_id, redirect_uri } = req.query as Record<string, string>;

  if (!payment_request_id) {
    res.status(400).json({ error: '`payment_request_id` query param is required' });
    return;
  }

  const redirectUri =
    redirect_uri ||
    `${process.env.PPB_APP_URL || 'http://localhost:5174'}/callback`;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    market: 'DE',
    locale: 'en_US',
    payment_request_id,
  });

  const linkUrl = `${TINK_LINK_URL}/1.0/pay/?${params.toString()}`;

  res.json({ linkUrl });
});

export default router;
