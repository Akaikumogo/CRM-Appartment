import { lazy, type JSX } from 'react';
import { type RouteObject } from 'react-router-dom';
import Navigator from './Providers/Navigator';
import NotFoundPage from './pages/NotFounds/NotFoundPage';
import ModuleNotFound from './pages/NotFounds/NotFoundModule';
import DashboardLayout from './Layout/Layout';

import AnimateWrapper from './components/AnimateWrapper';

const LoginPage = lazy(() => import('./pages/Login/Login'));
const HomePage = lazy(() => import('./pages/Home'));
const Chess = lazy(() => import('./pages/SalesIndicators/SalesIndicators'));
const Workers = lazy(() => import('./pages/Workers'));
const ContractsPage = lazy(() => import('./pages/Contracts/Contract'));
const ContractDetailPage = lazy(
  () => import('./pages/Contracts/ContractDetails')
);
const ClientsPage = lazy(() => import('./pages/Clients/Clients'));
const BlocksPage = lazy(() => import('./pages/Block/Block'));
const FloorsPage = lazy(() => import('./pages/Floor/Floor'));
const ApartmentsPage = lazy(() => import('./pages/Appartment/Appartment'));
const withSuspense = (
  Component: React.LazyExoticComponent<() => JSX.Element>
) => {
  return (
    <AnimateWrapper>
      <Component />
    </AnimateWrapper>
  );
};
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigator />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          {
            path: 'home',
            element: withSuspense(HomePage)
          },
          {
            path: 'sales-indicators',
            element: withSuspense(Chess)
          },
          {
            path: 'show-rooms',
            element: (
              <iframe
                src="http://185.217.131.96:3003/eng/home"
                title="ShowRoom"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="fullscreen"
              />
            )
          },
          {
            path: 'workers',
            element: withSuspense(Workers)
          },
          {
            path: 'contracts',
            element: withSuspense(ContractsPage)
          },
          {
            path: 'contracts/:contractId',
            element: withSuspense(ContractDetailPage)
          },
          {
            path: 'clients',
            element: withSuspense(ClientsPage)
          },
          {
            path: 'blocks',
            element: withSuspense(BlocksPage)
          },
          {
            path: 'floors',
            element: withSuspense(FloorsPage)
          },
          {
            path: 'appartments',
            element: withSuspense(ApartmentsPage)
          },
          {
            path: '*',
            element: <ModuleNotFound />
          }
        ]
      }
    ]
  },
  {
    path: 'login',
    element: withSuspense(LoginPage)
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];
