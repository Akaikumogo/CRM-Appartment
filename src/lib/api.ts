import axios from 'axios';

// const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const baseURL =
  import.meta.env.VITE_API_URL ?? 'https://crm-pro-backend.akaikumogo.uz';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: {
    response?: {
      status?: number;
      data?: { code?: string; message?: string; supportPhone?: string };
    };
  }) => {
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
