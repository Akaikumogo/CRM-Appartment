import axios, { type AxiosError } from 'axios';
import { env } from './env';

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ApiErrorBody {
  code?: string;
  message?: string | string[];
  supportPhone?: string;
  requestId?: string;
}

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorBody>) => {
    const status = err.response?.status;
    const data = err.response?.data;
    if (
      status === 403 &&
      (data?.code === 'ORG_BLOCKED' || data?.code === 'BRANCH_BLOCKED')
    ) {
      localStorage.setItem('organizationBlocked', '1');
      const sp = typeof data.supportPhone === 'string' ? data.supportPhone : '';
      if (sp) {
        localStorage.setItem('supportPhone', sp);
      }
      window.dispatchEvent(new Event('org-blocked-changed'));
    }
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('organizationBlocked');
      localStorage.removeItem('supportPhone');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);

export function getApiErrorMessage(err: unknown, fallback = 'Xatolik yuz berdi'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorBody | undefined;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
    if (err.code === 'ECONNABORTED') return 'So‘rov vaqti tugadi';
    if (err.code === 'ERR_NETWORK') return 'Tarmoq xatosi, internetni tekshiring';
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
