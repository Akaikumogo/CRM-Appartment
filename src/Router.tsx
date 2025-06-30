import { type RouteObject } from 'react-router-dom';
import Navigator from './Providers/Navigator';
import NotFoundPage from './pages/NotFounds/NotFoundPage';
import ModuleNotFound from './pages/NotFounds/NotFoundModule';
import LoginPage from './pages/Login/Login';
import DashboardLayout from './Layout/Layout';
import HomePage from './pages/Home';
import Chess from './pages/SalesIndicators/SalesIndicators';
import Workers from './pages/Workers';
import ContractsPage from './pages/Contracts/Contract';
import ContractDetailPage from './pages/Contracts/ContractDetails';
import ClientsPage from './pages/Clients/Clients';
import BlocksPage from './pages/Block/Block';
import FloorsPage from './pages/Floor/Floor';
import ApartmentsPage from './pages/Appartment/Appartment';

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
            element: <HomePage />
          },
          {
            path: 'sales-indicators',
            element: <Chess />
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
            element: <Workers />
          },
          {
            path: 'contracts',
            element: <ContractsPage />
          },
          {
            path: 'contracts/:contractId',
            element: <ContractDetailPage />
          },
          {
            path: 'clients',
            element: <ClientsPage />
          },
          {
            path: 'blocks',
            element: <BlocksPage />
          },
          {
            path: 'floors',
            element: <FloorsPage />
          },
          {
            path: 'appartments',
            element: <ApartmentsPage />
          },
          { path: '*', element: <ModuleNotFound /> }
        ]
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
