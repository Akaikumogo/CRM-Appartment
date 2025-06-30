import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const Navigator = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === '/' || pathname === '/dashboard') {
      // if (isLoggedIn) {
      navigate('/dashboard/home');
      // } else {
      //   navigate('/login');
      // }
    }
  }, [isLoggedIn, navigate, pathname]);

  return (
    <div className="w-screen h-screen">
      <Outlet />
    </div>
  );
};

export default Navigator;
