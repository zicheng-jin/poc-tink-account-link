import 'dotenv/config'; // MUST be first — loads .env before any route module captures process.env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

// Routes
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
