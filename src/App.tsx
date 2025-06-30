import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import { routes } from './Router';
import { useApp } from './Providers/Configuration';
import { ConfigProvider, theme } from 'antd';

const App = () => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const splashAlreadyShown = sessionStorage.getItem('splashShown') === 'true';
    if (!splashAlreadyShown) {
      setShowSplash(true);
    }
  }, []);
  const { theme: darkOrLight } = useApp();
  return (
    <>
      <AnimatePresence mode="sync">
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <ConfigProvider
          theme={{
            algorithm:
              darkOrLight === 'dark'
                ? theme.darkAlgorithm
                : theme.defaultAlgorithm,
            token: {
              colorPrimary: '#6bd2bc'
            }
          }}
        >
          {!showSplash && (
            <RouterProvider router={createBrowserRouter(routes)} />
          )}
        </ConfigProvider>
      </AnimatePresence>
    </>
  );
};

export default App;
