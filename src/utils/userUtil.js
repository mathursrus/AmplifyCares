import { fetchAndInsertToken, fetchWithToken, getApiHost, getApiUrl } from './urlUtil';

var latest_user_info;

export const getUserInfo = () => {
    return latest_user_info;        
}

export const getUserMode = () => {
    if (latest_user_info && latest_user_info.mode) {
        return latest_user_info.mode;
    } else {
        return "Performance";
    }
}

export const setUserMode = (newMode) => {
    if (latest_user_info) {
        latest_user_info.mode = newMode;
    }
    fetchAndInsertToken(getApiUrl(`/setUserPreference?user=${localStorage.getItem('userName')}&preference=mode&value=${newMode}`))
    .then((response) => {
        if (response.status === 200) {
            parseUserInfo(response);
        }
    });    
}

export const getAlias = (username) => {
    return username.split('@')[0];
}

export const getSelfCareStats = async (start, end, category) => {
    const response = await fetchAndInsertToken(getApiUrl(`/getselfcarestats/?item=${localStorage.getItem('userName')}&startDay=${start.toLocaleDateString()}&endDay=${end.toLocaleDateString()}&category=${category}`));
    const data = await response.json();
    return JSON.parse(data);
}

export const getMedianCareStats = async (start, end, category) => {
    const response = await fetchAndInsertToken(getApiUrl(`/getpercentiles?item=50&startDay=${start.toLocaleDateString()}&endDay=${end.toLocaleDateString()}&category=${category}`));
    const data = await response.json();
    return JSON.parse(data);
}

export const getHighCareStats = async (start, end, category) => {
    const response = await fetchAndInsertToken(getApiUrl(`/getpercentiles?item=99&startDay=${start.toLocaleDateString()}&endDay=${end.toLocaleDateString()}&category=${category}`));
    const data = await response.json();
    return JSON.parse(data);
}

export const getHabitsData = async (start, end, category) => {
    const response = await getSelfCareStats(start, end, category);
    return processHabitsData(response, start, end);
}

export const processHabitsData = (selfCareData, start, end) => {
    const myData = [];
    console.log("Processing habits for dates ", start, " to ", end);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = ""+year+"-"+month+"-"+day;

        // populate data points per day
        const habitsPoint = selfCareData.find(point => point._id === dateString);
        //console.log("Got habits Point ", habitsPoint);
        const habitsData = habitsPoint? processActivityData([habitsPoint]):[];      
        myData.push({
            date: dateString,
            habits_data: habitsData
        });      
    }   
    return restructureHabitData(myData);
}

export const processActivityData = (data) => {
    //console.log("Processing Activity Data ", data);
    const activityMap = new Map();

    data.forEach((entry) => {
        const activities = entry.activities.filter((activity) => activity[0] !== null);

        activities.forEach((activity) => {
            const [activityNames, activityValue] = activity;
            if (activityNames !== undefined && activityNames.length > 0) {          
                activityNames.forEach((activityName) => {
                if (activityName !== null) {              
                    if (activityMap.has(activityName)) {
                    activityMap.set(activityName, activityMap.get(activityName) + activityValue);
                    } else {
                    activityMap.set(activityName, activityValue);
                    }
                }
                });
            }
        });
    });      
    const result = [];
    if (activityMap.size > 0) {
        activityMap.forEach((value, key) => {
        result.push({text: key, value});
        });
    }    

    return result;
}

export const restructureHabitData = (inputData) => {
    // Create a Set to store all unique habit names
    const habitNamesSet = new Set();
          
    // Iterate through the inputData to build the habitNamesSet
    inputData.forEach((entry) => {
      const { habits_data } = entry;
      habits_data.forEach((habit) => {
        const { text } = habit;
        if (!habitNamesSet.has(text)) {
          habitNamesSet.add(text);          
        }
      });
    });
        
    // Create an array to store the restructured data
    const habitTimeArray = [];
  
    inputData.forEach((entry) => {
      const { date, habits_data } = entry;
  
      // Initialize a date entry with all habits set to 0
      const dateEntry = { date };
      for (const habitName of habitNamesSet) {
        dateEntry[habitName] = 0;
      }
  
      habits_data.forEach((habit) => {
        const { text, value } = habit;
        // Update the value for the corresponding habit in the date entry
        dateEntry[text] = value===0?1:value;
      });
  
        // Push the date entry to the array
        habitTimeArray.push(dateEntry);
    });

    console.log("Habit Time Array is ", habitTimeArray);

    return habitTimeArray;
} 

export const addHabitToDay = async (date, habit, category) => {
    const response = await fetchAndInsertToken(getApiUrl(`/addhabit?user=${localStorage.getItem('userName')}&date=${date}&habit=${habit}&category=${category}`));
    const data = await response.json();
    console.log("Added habit ", habit, " to date ", date, " with response ", data);
}

export const removeHabitFromDay = async (date, habit, category) => {
    const response = await fetchAndInsertToken(getApiUrl(`/removehabit?user=${localStorage.getItem('userName')}&date=${date}&habit=${habit}&category=${category}`));
    const data = await response.json();
    console.log("Removed habit ", habit, " from date ", date, " with response ", data);
}

export const refreshUserInfo = async (token) => {
    const response = await fetchWithToken(getApiHost() + "/getUserInfoWithToken", token?token:localStorage.getItem('usertoken'));
    const retval = await parseUserInfo(response);
    return retval;
}

const parseUserInfo = async (response) => {
    let retval = {};
    try {
      const data = await response.json();
      //console.log("Got user info ", data);
      const userInfo = JSON.parse(data);
      if (userInfo.length > 0) {
        localStorage.setItem('userDetails', JSON.stringify(userInfo[0]));
        retval = userInfo[0];        
      }
      //console.log("Returning user info ", retval);
      latest_user_info = retval;
      return retval;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw error; // Rethrow the error to be caught by the caller if needed
    }
};