/**
 * Runtime config for the merchant mobile app.
 *
 * Set EXPO_PUBLIC_PPB_APP_URL in .env.local to point at the
 * PPB web app running on your local network, e.g.:
 *   EXPO_PUBLIC_PPB_APP_URL=http://192.168.1.100:3000
 *
 * Physical devices cannot reach `localhost`; use your machine's
 * LAN IP address instead.
 */
const PPB_APP_URL = process.env.EXPO_PUBLIC_PPB_APP_URL ?? 'http://localhost:3000';

export const config = {
  ppbAppUrl: PPB_APP_URL,
} as const;
