import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { StationsProvider } from './context/StationsContext';
import { ThemeProvider } from './context/ThemeContext';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <StationsProvider>
          <App />
        </StationsProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
