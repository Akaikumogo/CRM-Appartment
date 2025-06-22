import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from 'antd';

import { AppProvider } from './Providers/Configuration.tsx';
import MainContext from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App>
      <MainContext />
    </App>
  </AppProvider>
);
