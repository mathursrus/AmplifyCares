export const howLongAgo = (utcTimestamp) => { 
    if (utcTimestamp)    {
        // Get the current time in UTC
        const currentTime = Date.now();
        
        // Calculate the time difference in milliseconds
        const timeDifference = currentTime - utcTimestamp;
        
        // Define time units
        const millisecondsPerSecond = 1000;
        const secondsPerMinute = 60;
        const minutesPerHour = 60;
        const hoursPerDay = 24;
        
        // Calculate time delta in various units
        const secondsDelta = timeDifference / millisecondsPerSecond;
        const minutesDelta = secondsDelta / secondsPerMinute;
        const hoursDelta = minutesDelta / minutesPerHour;
        const daysDelta = hoursDelta / hoursPerDay;
        
        // Determine the appropriate human-readable string
        if (secondsDelta < 60) {
            return "a few seconds ago";
        } else if (minutesDelta < 10) {
            return "a few minutes ago";
        } else if (minutesDelta < 60) {
            return `${Math.floor(minutesDelta)} minutes ago`;
        } else if (hoursDelta < 24) {
            return `${Math.floor(hoursDelta)} hours ago`;
        } else {
            return `${Math.floor(daysDelta)} days ago`;
        }            
    }
    else {
        return "long ago";
    }
}