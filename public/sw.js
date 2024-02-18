let goals = null;
let interval = null;

// Inside your service worker (sw.js)
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  // Clear any previous interval if it exists
  if (interval) {
    clearInterval(interval);
    interval = undefined;
    console.log('Previous interval cleared');
  }
  // Set a new interval
  interval = setInterval(() => {
    if (goals === null) {
      return;
    }
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysOfWeek[now.getDay()]; // Returns the name of the day of the week
    const isFirstDayOfMonth = (now.getDate() === 1);
    const isLastDayOfMonth = (now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());

    console.log("Checking for goals at ", hours, ":", minutes, " on ", today);

    const hasDailyFrequency = Object.values(goals).some(categoryGoals =>
      categoryGoals.length > 0 && categoryGoals.some(goal => goal.frequency === 'daily')
    );
    
    const hasWeeklyFrequency = Object.values(goals).some(categoryGoals =>
      categoryGoals.length > 0 && categoryGoals.some(goal => goal.frequency === 'weekly')
    );
    
    const hasMonthlyFrequency = Object.values(goals).some(categoryGoals =>
      categoryGoals.length > 0 && categoryGoals.some(goal => goal.frequency === 'monthly')
    );

    const matches = []; 
    if (hasDailyFrequency && goals.dailyCheckinInfo && goals.dailyCheckinInfo.time) {
      const timeParts = goals.dailyCheckinInfo.time.split(':');
      const dailyHours = parseInt(timeParts[0]);
      const dailyMinutes = parseInt(timeParts[1]);
      if (hours === dailyHours && (minutes >= dailyMinutes) && (minutes-dailyMinutes) < 1) {
        matches.push('daily');
      }
    }
    if (hasWeeklyFrequency && goals.weeklyCheckinInfo && goals.weeklyCheckinInfo.time && goals.weeklyCheckinInfo.day) { 
      const day = goals.weeklyCheckinInfo.day;
      const timeParts = goals.weeklyCheckinInfo.time.split(':');
      const dailyHours = parseInt(timeParts[0]);
      const dailyMinutes = parseInt(timeParts[1]);
      if (day === today && hours === dailyHours && (minutes >= dailyMinutes) && (minutes-dailyMinutes) < 1) {
        matches.push('weekly');
      }
    }
    if (hasMonthlyFrequency && goals.monthlyCheckinInfo && goals.monthlyCheckinInfo.time && goals.monthlyCheckinInfo.day) { 
      const day = goals.monthlyCheckinInfo.day;
      const timeParts = goals.monthlyCheckinInfo.time.split(':');
      const dailyHours = parseInt(timeParts[0]);
      const dailyMinutes = parseInt(timeParts[1]);
      if (((day === 'First' && isFirstDayOfMonth) || (day === 'Last' && isLastDayOfMonth)) && hours === dailyHours && (minutes >= dailyMinutes) && (minutes-dailyMinutes) < 1) {
        matches.push('monthly');
      }
    }
    if (matches.length > 0) {
      console.log("Matches found ", matches);
      const notificationText = `This is an accountability reminder to check in for your goals. Click to check in now.`;
      var url = '/goals?';
      for (const match of matches) {
        url += `expanded=${match}&`;
      }
      sendNotification('Rock your self care goals!', notificationText, url);
    }
  }, 60 * 1000);
  console.log("Periodic sync registered");
  console.log('Service Worker activated');
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'updateGoals') {
      console.log("Service worker received goals ", event.data.goals);
      goals = event.data.goals;      
  }
});

self.addEventListener('push', function(event) {
  console.log("Push received");
  sendNotification('Notification Title', event.data.text());
  console.log("Push shown");
});
  
function sendNotification(title, body, urlstring) {
  console.log("Sending notification with url ", urlstring);
  self.registration.showNotification(title, {
    body: body,
    icon: 'logo192.png', // Customize the icon
    image: urlstring
  });
}

self.addEventListener('notificationclick', function(event) {
  console.log("Notification clicked ", event.notification);
  event.notification.close(); // Close the notification

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.image); // Redirect to the root URL or your desired screen
      }
    })
  );
});
