import { lazy, type JSX } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import Navigator from './Providers/Navigator';
import NotFoundPage from './pages/NotFounds/NotFoundPage';
import ModuleNotFound from './pages/NotFounds/NotFoundModule';
import DashboardLayout from './Layout/Layout';
import SuperAdminLayout from './Layout/SuperAdminLayout';

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
const ShowroomLaunch = lazy(() => import('./pages/ShowroomLaunch'));
const AdminOrganizations = lazy(() => import('./pages/admin/AdminOrganizations'));
const AdminKassa = lazy(() => import('./pages/admin/AdminKassa'));
const AdminBlocked = lazy(() => import('./pages/admin/AdminBlocked'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const BranchesMgmt = lazy(() => import('./pages/BranchesMgmt'));
const PermissionsOrg = lazy(() => import('./pages/PermissionsOrg'));
const MyPermissions = lazy(() => import('./pages/MyPermissions'));
const AdminPermissions = lazy(() => import('./pages/admin/AdminPermissions'));
const AdminBackups = lazy(() => import('./pages/admin/AdminBackups'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
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
        path: 'admin',
        element: <SuperAdminLayout />,
        children: [
          { index: true, element: <Navigate to="organizations" replace /> },
          {
            path: 'organizations',
            element: withSuspense(AdminOrganizations),
          },
          {
            path: 'kassa',
            element: withSuspense(AdminKassa),
          },
          {
            path: 'blocked',
            element: withSuspense(AdminBlocked),
          },
          {
            path: 'notifications',
            element: withSuspense(AdminNotifications),
          },
          {
            path: 'permissions',
            element: withSuspense(AdminPermissions),
          },
          {
            path: 'backups',
            element: withSuspense(AdminBackups),
          },
          {
            path: 'inventory',
            element: withSuspense(AdminInventory),
          },
        ],
      },
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
            element: withSuspense(ShowroomLaunch)
          },
          {
            path: 'legal',
            element: withSuspense(LegalPage),
          },
          {
            path: 'branches',
            element: withSuspense(BranchesMgmt),
          },
          {
            path: 'permissions',
            element: withSuspense(PermissionsOrg),
          },
          {
            path: 'my-permissions',
            element: withSuspense(MyPermissions),
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
