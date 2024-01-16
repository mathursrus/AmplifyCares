import { fetchWithToken, getApiHost, postWithToken } from "./urlUtil";

export const getUserGoals = async () => {
    const results = await fetchWithToken(getApiHost()+`/getusergoals/?item=${localStorage.getItem('userName')}`, localStorage.getItem('usertoken'));
    const data = await results.json();
    console.log("Util got user goals ", data);
    return JSON.parse(data)[0];    
}

export const saveUserGoals = (userGoals) => {
    return postWithToken('/writeusergoals', userGoals, localStorage.getItem('usertoken')); 
}