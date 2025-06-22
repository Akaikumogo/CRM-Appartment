import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import { routes } from './Router';

const App = () => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const splashAlreadyShown = sessionStorage.getItem('splashShown') === 'true';
    if (!splashAlreadyShown) {
      setShowSplash(true);
    }
  }, []);

  return (
    <>
      <AnimatePresence mode="sync">
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>
      {!showSplash && <RouterProvider router={createBrowserRouter(routes)} />}
    </>
  );
};

export default App;
