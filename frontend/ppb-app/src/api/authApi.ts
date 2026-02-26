import axios from 'axios';
import { config } from '@/lib/config';

export async function fetchAppToken(): Promise<string> {
  const response = await axios.post<{ token: string }>(
    `${config.backendUrl}/api/auth/token`
  );
  return response.data.token;
}
