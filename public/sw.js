let interval;

// Inside your service worker (sw.js)
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  interval = setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    //const minutes = now.getMinutes();
    console.log("Checking time ", now);
    if (hours === 9) {
      sendNotification('Good morning!', 'This is your daily reminder to rock your habits. Will fine tune this notification soon.');
    }
  }, 10 * 60 * 1000);
  console.log("Periodic sync registered");
});

self.addEventListener('activate', (event) => {
  clearInterval(interval);
  console.log('Service Worker activated');
});

self.addEventListener('push', function(event) {
  console.log("Push received");
  sendNotification('Notification Title', event.data.text());
  console.log("Push shown");
  /*
  const options = {
    body: event.data.text(),
    icon: 'logo192.png', // Customize the notification icon
    badge: 'logo192.png', // Customize the notification badge
  };

  

  event.waitUntil(
    self.registration.showNotification('Notification Title', options)
  );
  */
});
  
function sendNotification(title, body) {
  self.registration.showNotification(title, {
    body: body,
    icon: 'logo192.png', // Customize the icon
  });
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Close the notification

  console.log("Notification clicked");

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/'); // Redirect to the root URL or your desired screen
      }
    })
  );
});
