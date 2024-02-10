import { fetchWithToken, getApiHost, postWithToken } from "./urlUtil";

export const getUserGoals = async () => {
    const results = await fetchWithToken(getApiHost()+`/getusergoals/?item=${localStorage.getItem('userName')}`, localStorage.getItem('usertoken'));
    const data = await results.json();
    //console.log("Util got user goals ", data);
    const goals = JSON.parse(data);
    if (goals && goals.length > 0) {
        return goals[0];
    }
    else {
        return {};
    }    
}

export const saveUserGoals = (userGoals) => {
    return postWithToken('/writeusergoals', userGoals, localStorage.getItem('usertoken')); 
}

export const getGoalSettingStep = (goal) => {
    if (goal) {
        const step1complete = (goal.identity && goal.identity !== '');
        const step2complete = (goal.goals && Object.values(goal.goals).some((array) => array.length > 0 && array[0].goal && array[0].goal !== ''));
        const step3complete = step2complete;
        const goalSettingStep = (step1complete && step2complete && step3complete)?4:
                                (step1complete && step2complete)? 3: 
                                    (step1complete? 2:1);
        return goalSettingStep;
    }
    return 1;
}