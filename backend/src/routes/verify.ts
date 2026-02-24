import { Router, Request, Response } from 'express';

const router = Router();

interface VerifyBody {
  paymentRequestId: string;
}

// Mock delay to simulate a real API call
const mockDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

router.post('/verify-payment', async (req: Request, res: Response): Promise<void> => {
  const { paymentRequestId } = req.body as VerifyBody;

  if (!paymentRequestId) {
    res.status(400).json({ error: 'paymentRequestId is required' });
    return;
  }

  try {
    // Simulate account verification API call (~500ms)
    await mockDelay(500);

    // In a real scenario, call Tink /api/v1/payments/requests/{id}
    // to check status, then trigger account linking in your backend

    console.log(`[verify-payment] ✅ Verified paymentRequestId: ${paymentRequestId}`);

    res.json({
      status: 'SUCCESS',
      paymentRequestId,
      message: 'Account verification successful',
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    const error = err as Error;
    console.error('[verify-payment] Error:', error.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
