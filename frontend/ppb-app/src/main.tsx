import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { fetchAppToken } from './api/authApi'

// --app-height polyfill: window.innerHeight already excludes the mobile
// browser URL bar on all browsers (including old Safari < 15.4 where
// 100vh incorrectly equals the full screen height).
function updateAppHeight() {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
updateAppHeight();
window.addEventListener('resize', updateAppHeight);

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
