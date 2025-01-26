import ReactDOM from 'react-dom/client';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { startServiceWorker } from '@/services/register-service-worker';
import { ThemeProvider } from '@/components';
import { routes } from './routes';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import './styles/main.scss';

const router = createBrowserRouter(routes);

startServiceWorker();

ReactDOM.hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <Provider store={store}>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </Provider>,
);
