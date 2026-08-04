import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './lib/i18n';
import { AdminPanel } from './components/AdminPanel';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/hidden-master-panel" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
