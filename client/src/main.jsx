import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { store, persistor } from './redux/store.js';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const render = () =>
  createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      {/* wait for the saved login to load before rendering, otherwise protected pages redirect on refresh */}
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );

// VITE_DEMO_SNAPSHOT=true (set only on a backend-less host such as Vercel) shows a frozen snapshot
// of the listings instead of calling the real backend. When it's not set, the demo code isn't
// even included in the build.
if (import.meta.env.VITE_DEMO_SNAPSHOT === 'true') {
  import('./demo/installDemoApi.js').then(render);
} else {
  render();
}
