self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('your-cache-name').then(function(cache) {
        return cache.addAll([
          // Add files to be cached (e.g., your app's static assets)
        ]);
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
  