import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './features/auth/hooks/useAuth';
import { AppProviders } from './features/shared/utils/providers';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>,
);
