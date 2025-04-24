import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/accessibility.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Vérifier si un root existe déjà
let root = (window as any).__reactRoot;
if (!root) {
  root = createRoot(rootElement);
  (window as any).__reactRoot = root;
}

root.render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Cleanup lors du unmount
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    root.unmount();
    delete (window as any).__reactRoot;
  });
}