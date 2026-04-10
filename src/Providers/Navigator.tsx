import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getSessionUser } from '@/lib/sessionUser';

const Navigator = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const onLogin = pathname === '/login';
    const user = getSessionUser();

    if (!token && !onLogin) {
      navigate('/login', { replace: true });
      return;
    }
    if (token && onLogin) {
      navigate(
        user?.role === 'superadmin'
          ? '/admin/organizations'
          : '/dashboard/home',
        { replace: true },
      );
      return;
    }
    if (token && user?.role === 'superadmin' && pathname.startsWith('/dashboard')) {
      navigate('/admin/organizations', { replace: true });
      return;
    }
    if (token && pathname === '/admin') {
      navigate('/admin/organizations', { replace: true });
      return;
    }
    if (token && user?.role !== 'superadmin' && pathname.startsWith('/admin')) {
      navigate('/dashboard/home', { replace: true });
      return;
    }
    if (pathname === '/' || pathname === '/dashboard') {
      navigate(
        user?.role === 'superadmin'
          ? '/admin/organizations'
          : '/dashboard/home',
        { replace: true },
      );
    }
  }, [navigate, pathname, token]);

  return (
    <div className="w-screen h-screen">
      <Outlet />
    </div>
  );
};

export default Navigator;
