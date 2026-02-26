import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { fetchAppToken } from './api/authApi'

const PPB_JWT_KEY = 'ppb_jwt';

async function bootstrap() {
  try {
    const token = await fetchAppToken();
    sessionStorage.setItem(PPB_JWT_KEY, token);
  } catch (err) {
    console.error('[ppb-app] Failed to fetch app token. API calls may be rejected.', err);
  }
  createRoot(document.getElementById('root')!).render(<App />);
}

bootstrap();
