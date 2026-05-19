export type SessionUser = {
  id: string;
  email: string;
  role: 'superadmin' | 'org_admin' | 'staff';
  organizationId: string | null;
  branchId: string | null;
  fullName: string | null;
  /** From login or /auth/me; STAFF menu + guards */
  effectivePermissions?: string[];
};

/** JWT payload exp field decode (no crypto verify — just expiry check). */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1])) as { exp?: number };
    if (!payload.exp) return false;
    return Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

export function getSessionUser(): SessionUser | null {
  const token = localStorage.getItem('token');
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    return null;
  }
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

const ORG_BLOCKED_KEY = 'organizationBlocked';
const SUPPORT_PHONE_KEY = 'supportPhone';

export function setSessionAuth(token: string, user: SessionUser) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
}

export function setOrgBlockedMeta(blocked: boolean, supportPhone?: string) {
  if (blocked) {
    localStorage.setItem(ORG_BLOCKED_KEY, '1');
    if (supportPhone) {
      localStorage.setItem(SUPPORT_PHONE_KEY, supportPhone);
    }
  } else {
    localStorage.removeItem(ORG_BLOCKED_KEY);
    localStorage.removeItem(SUPPORT_PHONE_KEY);
  }
  window.dispatchEvent(new Event('org-blocked-changed'));
}

export function isOrgBlockedInSession(): boolean {
  return localStorage.getItem(ORG_BLOCKED_KEY) === '1';
}

export function getSupportPhoneFromSession(): string {
  return (
    localStorage.getItem(SUPPORT_PHONE_KEY) ||
    import.meta.env.VITE_SUPPORT_PHONE ||
    ''
  );
}

export function clearSessionAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem(ORG_BLOCKED_KEY);
  localStorage.removeItem(SUPPORT_PHONE_KEY);
}
