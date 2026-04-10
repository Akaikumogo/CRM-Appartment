import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { App } from 'antd';

import { AppProvider } from './Providers/Configuration.tsx';
import MainContext from './App.tsx';
import { queryClient } from './lib/queryClient';

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <App>
        <MainContext />
      </App>
    </AppProvider>
  </QueryClientProvider>
);
