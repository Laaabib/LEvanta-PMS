// Ensure fetch is writable in strict mode or restricted iframe contexts
if (typeof window !== 'undefined') {
  try {
    const origFetch = window.fetch ? window.fetch.bind(window) : undefined;
    let currentFetch = origFetch;
    try {
      Object.defineProperty(window, 'fetch', {
        get() {
          return currentFetch || origFetch;
        },
        set(v) {
          currentFetch = v;
        },
        configurable: true,
        enumerable: true
      });
    } catch {
      // Ignored if already defined
    }
  } catch {}
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

