// Docker runtime config (placeholders replaced by nginx envsubst)
// window.__APP_CONFIG__ = {
//   BACKEND_URL: "__BACKEND_URL__",
//   PPB_APP_URL: "__PPB_APP_URL__",
//   MERCHANT_APP_URL: "__MERCHANT_APP_URL__"
// };

// Local dev config — update IP to match your current network
// window.__APP_CONFIG__ = {
//   BACKEND_URL: "",
//   PPB_APP_URL: "https://vendetta-absolve-emphasize.ngrok-free.dev",
//   MERCHANT_APP_URL: "http://192.168.0.185:3001"
// };
window.__APP_CONFIG__ = {
  BACKEND_URL: "",
  PPB_APP_URL: "https://vendetta-absolve-emphasize.ngrok-free.dev",
  MERCHANT_APP_URL: "http://172.20.10.2:3001"
};
