import { StrictMode }  from 'react';
import { createRoot }  from 'react-dom/client';

import './index.css';
import App from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    '[NagarSetu] Mount failed: no element with id="root" found in index.html.\n' +
    'Make sure index.html contains <div id="root"></div>.'
  );
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);