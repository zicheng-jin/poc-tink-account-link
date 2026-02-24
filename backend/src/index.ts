import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import paymentRouter from './routes/payment';
import verifyRouter from './routes/verify';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const MERCHANT_APP_URL = process.env.MERCHANT_APP_URL || 'http://localhost:5173';
const PPB_APP_URL = process.env.PPB_APP_URL || 'http://localhost:5174';

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
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api', paymentRouter);
app.use('/api', verifyRouter);

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
