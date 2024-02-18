import { fetchWithToken, getApiHost, postWithToken } from "./urlUtil";

export const getUserGoals = async () => {
    const results = await fetchWithToken(getApiHost()+`/getusergoals/?item=${localStorage.getItem('userName')}`, localStorage.getItem('usertoken'));
    const data = await results.json();
    const goals = JSON.parse(data);
    if (goals && goals.length > 0) {
        updateServiceWorkerWithGoals(goals[0].goals);
        return goals[0];
    }
    else {
        updateServiceWorkerWithGoals({});
        return {};
    }    
}

function updateServiceWorkerWithGoals(goals) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function(registration) {
            registration.active.postMessage({type: 'updateGoals', goals: goals});
        });       
    }
}

export const saveUserGoals = (userGoals) => {
    return postWithToken('/writeusergoals', userGoals, localStorage.getItem('usertoken')); 
}

export const saveCheckindata = (checkinData) => {
    return postWithToken('/writeusergoalcheckin', checkinData, localStorage.getItem('usertoken')); 
}

export const getCheckinData = async (date) => {
    const formattedDate = date.toLocaleDateString();
    const results = await fetchWithToken(getApiHost()+`/getusergoalcheckin/?user=${localStorage.getItem('userName')}&date=${formattedDate}`, localStorage.getItem('usertoken'));
    const data = await results.json();
    //console.log("Util got goal checkin ", data);
    const retval = JSON.parse(data);
    if (retval && retval.length > 0) {
        return retval[0];
    }
    else {
        return {};
    } 
}

export const getGoalID = (goal) => {
    if (goal.id) {
        return goal.id;
    }
    // if the goal does not have an id, return the goal name
    return goal.goal;
}

export const isGoalCategory = (category) => {
    return ['mental', 'physical', 'spiritual', 'social'].includes(category.toLowerCase());
}

export const getGoalSettingStep = (goal) => {
    if (goal) {
        const step1complete = (goal.identity && goal.identity !== '');
        const step2complete = (goal.goals && Object.values(goal.goals).some((array) => array.length > 0 && array[0].goal && array[0].goal !== ''));
        const step3complete = (goal.goals && (goal.goals.dailyCheckinInfo || goal.goals.weeklyCheckinInfo || goal.goals.monthlyCheckinInfo));
        const goalSettingStep = (step1complete && step2complete && step3complete)?4:
                                (step1complete && step2complete)? 3: 
                                    (step1complete? 2:1);
        return goalSettingStep;
    }
    return 1;
}