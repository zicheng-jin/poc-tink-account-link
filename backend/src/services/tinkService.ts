import axios from 'axios';

const TINK_API_URL = process.env.TINK_API_URL || 'https://api.tink.com';
const TINK_LINK_URL = process.env.TINK_LINK_URL || 'https://link.tink.com';
const CLIENT_ID = process.env.TINK_CLIENT_ID || '';
const CLIENT_SECRET = process.env.TINK_CLIENT_SECRET || '';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface PaymentRequestResponse {
  id: string;
  status: string;
  amount: {
    value: { scale: number; unscaledValue: string };
    currencyCode: string;
  };
}

export async function getClientAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope: 'payment:write,payment:read',
  });

  const response = await axios.post<TokenResponse>(
    `${TINK_API_URL}/api/v1/oauth/token`,
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data.access_token;
}

export async function createPaymentRequest(
  accessToken: string,
  amount: number,
  currency: string,
  destinationIban: string,
  destinationName: string,
  message: string
): Promise<string> {
  const response = await axios.post<PaymentRequestResponse>(
    `${TINK_API_URL}/api/v1/payments/requests`,
    {
      destinations: [
        {
          accountNumber: destinationIban,
          type: 'iban',
          name: destinationName,
        },
      ],
      amount: {
        value: {
          scale: 2,
          unscaledValue: String(Math.round(amount * 100)),
        },
        currencyCode: currency,
      },
      market: 'DE',
      sourceMessage: message,
      remittanceInformation: {
        type: 'UNSTRUCTURED',
        value: message,
      },
      paymentScheme: 'SEPA_CREDIT_TRANSFER',
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.id;
}

export function buildTinkLinkUrl(
  paymentRequestId: string,
  redirectUri: string
): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    market: 'DE',
    locale: 'en_US',
    redirect_uri: redirectUri,
    payment_request_id: paymentRequestId,
  });

  return `${TINK_LINK_URL}/1.0/pay/transactions/create?${params.toString()}`;
}
