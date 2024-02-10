import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppPage from './App';
import reportWebVitals from './reportWebVitals';
import { checkPushSubscription } from './utils/notificationsUtil';

/*console.log = (function(logFunc){
  return function(text){
      logFunc(text);
      // Also output the log to an element on the page
      document.getElementById('console-output').innerText += text + '\n';
  }
}(console.log));*/

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Unregister any existing service workers first
      await navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Successfully unregistered old service worker:', registration.scope);
            } else {
              console.error('Failed to unregister old service worker:', registration.scope);
            }
          });
        }
      });

      // Now register the new service worker
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Wait until the service worker is activated and ready
      await navigator.serviceWorker.ready;

      // Check and handle push subscription
      await checkPushSubscription(registration);
      console.log("Push subscription checked, moving on");

      // Register periodic sync after the service worker is ready
      setInterval(() => {
        console.log("Registering periodic sync");
        registration.sync.register('time-check');
      }, 10 * 60 * 1000);
      console.log("Periodic sync registered");
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
} 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
//  <React.StrictMode>
<div>
    <AppPage />
    <div id="console-output" style={{
      whiteSpace: 'pre-wrap',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ddd',
      padding: '10px',
      marginBottom: '20px',
      maxHeight: '300px',
      overflow: 'auto',
      display: 'none' // Change to 'block' to make it visible
  }}>
      Console Output...
  </div>
</div>
//  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
