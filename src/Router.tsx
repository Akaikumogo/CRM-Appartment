import { type RouteObject } from 'react-router-dom';
import Navigator from './Providers/Navigator';
import NotFoundPage from './pages/NotFounds/NotFoundPage';
import ModuleNotFound from './pages/NotFounds/NotFoundModule';
import LoginPage from './pages/Login/Login';
import DashboardLayout from './Layout/Layout';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigator />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [{ path: '*', element: <ModuleNotFound /> }]
      }
    ]
  },
  {
    path: 'login',
    element: <LoginPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];
