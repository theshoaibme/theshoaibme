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

function loadDeferredStylesheet(href: string, integrity?: string, crossOrigin?: string) {
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  if (integrity) link.integrity = integrity;
  if (crossOrigin) link.crossOrigin = crossOrigin;
  document.head.appendChild(link);
}

if (typeof window !== 'undefined') {
  const loadIcons = () => {
    loadDeferredStylesheet(
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
      'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==',
      'anonymous',
    );
    loadDeferredStylesheet(
      'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/devicon.min.css',
      'sha256-ohsW1KkP6RfCe24qro+KdGrtJ4T+sv8ZrvVZEJHz5k0=',
      'anonymous',
    );
  };
  if (document.readyState === 'complete') {
    loadIcons();
  } else {
    window.addEventListener('load', loadIcons, { once: true });
  }
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
