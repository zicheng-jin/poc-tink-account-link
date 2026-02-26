import 'dotenv/config'; // MUST be first — loads .env before any route module captures process.env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import authRouter from './routes/auth';
import paymentRouter from './routes/payment';
import verifyRouter from './routes/verify';
import tinkRouter from './routes/tink';
import mockRouter from './routes/mock';

const app = express();
const PORT = process.env.PORT || 3001;

const MERCHANT_APP_URL = process.env.MERCHANT_APP_URL || 'http://localhost:3001';
const PPB_APP_URL = process.env.PPB_APP_URL || 'http://localhost:3000';

// Guard: warn loudly if critical env vars are missing
const REQUIRED_ENV = ['TINK_CLIENT_ID', 'TINK_CLIENT_SECRET', 'TINK_API_URL'];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
  }
});
console.log(`🔑 TINK_CLIENT_ID: ${process.env.TINK_CLIENT_ID ? '✅ set' : '❌ MISSING'}`);
console.log(`🔑 TINK_CLIENT_SECRET: ${process.env.TINK_CLIENT_SECRET ? '✅ set' : '❌ MISSING'}`);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // handled in nginx for frontends
}));

// Strict CORS — only allow our two apps
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [MERCHANT_APP_URL, PPB_APP_URL];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Public route — issues the app-level JWT (no auth required)
app.use('/api', authRouter);

// JWT guard — protects all routes mounted after this point
app.use('/api', (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Protected routes
app.use('/api', paymentRouter);
app.use('/api', verifyRouter);
app.use('/api', tinkRouter);
app.use('/api', mockRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`   MERCHANT_APP_URL: ${MERCHANT_APP_URL}`);
  console.log(`   PPB_APP_URL:      ${PPB_APP_URL}`);
});

export default app;
