import { postWithBodyAndToken, urlBase64ToUint8Array } from "./urlUtil";

async function retrieveStoredSubscription(registration) {
    if (!registration.pushManager) {
        return null;
    }
    const existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
        return existingSubscription;
    } else {
        return null;
    }
  }

export const checkPushSubscription = async (registration) => {
    // Check if the subscription information is available (e.g., in IndexedDB or Local Storage)
    // For this example, let's assume you have a function to retrieve the subscription data
    const storedSubscription = await retrieveStoredSubscription(registration);
        
    if (storedSubscription) {
        //saveNotificationSubscription(storedSubscription);
        console.log("Got stored subcription ", storedSubscription);
        return;
    }
    await seekNotificationPermission();    
  }

export const seekNotificationPermission = () => {
    console.log("Seeking notification permission");
    if ('Notification' in window) {
        console.log("Notification supported ", Notification);
        if (Notification.permission === 'granted') {
            return;
        } 
        Notification.requestPermission().then(function (permission) {
            if (permission === 'granted') {
                console.log("User granted permission");
                subscribeUser();
            }
            else {
                console.log("User did not grant permission");                
            }
        });        
    }
}

function subscribeUser() {
    console.log("Subscribing user");
    if (localStorage.getItem('userName') && localStorage.getItem('userName') !== '') {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(function(registration) {
                if (!registration.pushManager) {
                console.error('Push manager unavailable :(');
                return;
                }
                
                const appKey = urlBase64ToUint8Array('BGgzf3Q1RhLD_SWMw62Mwqpj-NmuscTTfYibRVv1CGYNZHKc9hH0hQB3pE1MPYPabOF2W3hJZwl8sxMPJjOIME4');
                console.log("App key ", appKey);
                registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: appKey
                })
                .then(function(subscription) {
                console.log('Push subscription:', subscription);
                saveNotificationSubscription(subscription);
                })
                .catch(function(error) {
                console.error('Error during push subscription:', error);
                });
            });
        }
    }
  }
  
export const hasNotificationPermission = () => {
    console.log("Checking notification permission");
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            console.log("Notification permission granted");
            return true;
        }
    }
    console.log("Notification permission not granted");
    return false;
}

export const sendPushNotification = (title, body, urlstring) => {
    console.log("Sending push notification");
    if (hasNotificationPermission()) {
        navigator.serviceWorker.ready.then(function (registration) {
            console.log("Sending push notification to registration ", registration);
            registration.showNotification(title, {
                body: body,
                icon: 'logo192.png', // Customize the icon
                image: urlstring
            });
        });
    }
}

export const saveNotificationSubscription = async (subscription) => {
    //console.log("Saving notification subscription for user ", localStorage.getItem('userName'), " and subscription ", subscription, " and token ", localStorage.getItem('usertoken'));
    const requestBody = {};
    requestBody.subscription = subscription;
    requestBody.user = localStorage.getItem('userName');    
    return postWithBodyAndToken(`/addnotificationsubscription`, requestBody, localStorage.getItem('usertoken'));
}
  