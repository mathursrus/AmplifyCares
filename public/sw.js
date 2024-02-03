// Register a periodic background sync task
self.addEventListener('sync', (event) => {
  if (event.tag === 'time-check') {
    console.log("Periodic sync event received!");
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours === 0 && minutes < 15) {
      // Trigger the notification
      const options = {
        body: 'Good morning! It is now 7 AM.',
        icon: 'logo192.png',
        badge: 'logo192.png',
      };

      self.registration.showNotification('Daily Notification', options);
    }
  }
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    self.registration.periodicSync.register('time-check', {
      minInterval: 1, // 1 mins
    })
  );
});
  
self.addEventListener('activate', function(event) {
  // Cleanup old caches if needed
});

self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: 'logo192.png', // Customize the notification icon
    badge: 'logo192.png', // Customize the notification badge
  };

  console.log("Push received");

  event.waitUntil(
    self.registration.showNotification('Notification Title', options)
  );

  console.log("Push shown");
});
  
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
