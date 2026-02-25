declare global {
  interface Window {
    __APP_CONFIG__: {
      BACKEND_URL: string;
      PPB_APP_URL: string;
      MERCHANT_APP_URL: string;
    };
  }
}

function getRuntimeConfig() {
  const runtime = window.__APP_CONFIG__;
  const isPlaceholder = (val: string | undefined) => !val || val.startsWith('__');
  return {
    backendUrl: (!isPlaceholder(runtime?.BACKEND_URL) ? runtime.BACKEND_URL : null)
      ?? import.meta.env.VITE_BACKEND_URL
      ?? 'http://localhost:3002',
    ppbAppUrl: (!isPlaceholder(runtime?.PPB_APP_URL) ? runtime.PPB_APP_URL : null)
      ?? import.meta.env.VITE_PPB_APP_URL
      ?? 'http://localhost:3000',
    merchantAppUrl: (!isPlaceholder(runtime?.MERCHANT_APP_URL) ? runtime.MERCHANT_APP_URL : null)
      ?? import.meta.env.VITE_MERCHANT_APP_URL
      ?? 'http://localhost:3001',
  };
}

export const config = getRuntimeConfig();
