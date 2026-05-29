// Docker runtime config (placeholders replaced by nginx envsubst)
// window.__APP_CONFIG__ = {
//   BACKEND_URL: "__BACKEND_URL__",
//   PPB_APP_URL: "__PPB_APP_URL__",
//   MERCHANT_APP_URL: "__MERCHANT_APP_URL__"
// };

// Local dev config — update IP to match your current network
window.__APP_CONFIG__ = {
  BACKEND_URL: "http://192.168.0.185:3002",
  PPB_APP_URL: "https://vendetta-absolve-emphasize.ngrok-free.dev",
  MERCHANT_APP_URL: "http://192.168.0.185:3001"
};
