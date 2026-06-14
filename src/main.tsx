import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import '@/styles/global/style.css';
import '@/styles/modules/errors.css';

const savedTheme =
  document.cookie.split('; ').find((row) => row.startsWith('theme='))?.split('=')[1] || 'light';
if (savedTheme === 'dark') {
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
