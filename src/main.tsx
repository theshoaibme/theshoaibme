import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import { getInitialTheme } from '@/utils/cookies';
import { configureManualScrollRestoration } from '@/utils/hashScroll';
import '@/styles/global/style.css';
import '@/styles/modules/errors.css';

configureManualScrollRestoration();

if (getInitialTheme() === 'dark') {
  document.documentElement.classList.add('dark');
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
