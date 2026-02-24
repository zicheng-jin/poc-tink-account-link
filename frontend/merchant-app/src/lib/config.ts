export const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  ppbAppUrl: import.meta.env.VITE_PPB_APP_URL || 'http://localhost:5174',
  merchantAppUrl: import.meta.env.VITE_MERCHANT_APP_URL || 'http://localhost:5173',
} as const;
