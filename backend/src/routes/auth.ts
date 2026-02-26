import { Router, Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'];

// POST /api/auth/token
// Public endpoint — no credentials required (POC app-level token)
router.post('/auth/token', (_req: Request, res: Response): void => {
  const token = jwt.sign({ sub: 'ppb-app' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  res.json({ token });
});

export default router;
