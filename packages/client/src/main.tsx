import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { startServiceWorker } from '@/services/register-service-worker';

import App from './App';

import { store } from './redux/store/store';

import './styles/main.scss';

startServiceWorker();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
