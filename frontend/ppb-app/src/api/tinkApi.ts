import axios from 'axios';
import { config } from '@/lib/config';

// ---------------------------------------------------------------------------
// Shared axios instance — all calls go through here
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: config.backendUrl,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CreatePaymentRequestBody {
  recipient: {
    accountNumber: string;
    accountType: string;
  };
  amount: number;
  currency: string;
  market: string;
  recipientName: string;
  sourceMessage: string;
  remittanceInformation: {
    type: string;
    value: string;
  };
  paymentScheme: string;
}

export interface CreatePaymentRequestResponse {
  id: string;
  status: string;
}

export interface GetLinkUrlResponse {
  linkUrl: string;
}

export interface VerifyPaymentResponse {
  status: string;
  paymentRequestId?: string;
  message?: string;
  verifiedAt?: string;
}

// ---------------------------------------------------------------------------
// POST /api/tink/payment-request
// Creates a Tink payment request and returns its ID.
// ---------------------------------------------------------------------------
export async function createPaymentRequest(
  body: CreatePaymentRequestBody
): Promise<CreatePaymentRequestResponse> {
  const response = await api.post<CreatePaymentRequestResponse>(
    '/api/tink/payment-request',
    body
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// GET /api/tink/link-url
// Builds and returns the Tink Payment Link URL for a given payment request.
// ---------------------------------------------------------------------------
export async function getLinkUrl(
  paymentRequestId: string,
  redirectUri: string
): Promise<GetLinkUrlResponse> {
  const response = await api.get<GetLinkUrlResponse>('/api/tink/link-url', {
    params: { payment_request_id: paymentRequestId, redirect_uri: redirectUri },
  });
  return response.data;
}

// ---------------------------------------------------------------------------
// POST /api/verify-payment
// Verifies a completed Tink payment request (currently mocked).
// ---------------------------------------------------------------------------
export async function verifyPayment(
  paymentRequestId: string
): Promise<VerifyPaymentResponse> {
  const response = await api.post<VerifyPaymentResponse>('/api/verify-payment', {
    paymentRequestId,
  });
  return response.data;
}
