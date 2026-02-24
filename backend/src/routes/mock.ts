import { Router, Request, Response } from 'express';

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/mock/verify-account
// Returns a mocked successful verification response.
// ---------------------------------------------------------------------------
router.post('/mock/verify-account', (_req: Request, res: Response): void => {
  // Simulate a short processing delay
  setTimeout(() => {
    res.json({
      linkStatus: 'SUCCESSFUL',
      verifiedAt: new Date().toISOString(),
      message: 'Account verification completed successfully (mock)',
    });
  }, 300);
});

export default router;
