import React, { useEffect } from 'react';
import * as microsoftTeams from "@microsoft/teams-js";

const NotificationComponent = () => {
  // Function to send a notification
  /*const sendNotification = (message) => {
    if (window.parent !== window) {
        microsoftTeams.authentication.notifySuccess({ message });
    } else {
        console.log("Not in teams");
    }
  };*/

  // Function to check if it's 8 AM
  /*const is8AM = () => {
    const currentTime = new Date();
    return currentTime.getHours() === 8 && currentTime.getMinutes() === 0;
  };*/

  // Main function to send the "Good morning" notification
  /*const sendGoodMorningNotification = () => {
    //if (is8AM()) {
      sendNotification('Good morning! Start your day with positivity.');
    //}
  };*/

  useEffect(() => {
    // Schedule the notification check every minute
    //console.log("Setting 1 minute interval");
    //const interval = setInterval(sendGoodMorningNotification, 60000);

    // Clean up the interval when the component unmounts
    return () => {
      //clearInterval(interval);
    };
  });

  return <div></div>;
};

export default NotificationComponent;
