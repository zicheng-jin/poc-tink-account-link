import axios from 'axios';
import { config } from '@/lib/config';

// ---------------------------------------------------------------------------
// Shared axios instance — all merchant-app API calls go through here
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: config.backendUrl,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface HealthResponse {
  status: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------------------
export async function checkHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
}
