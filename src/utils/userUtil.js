import { fetchWithToken, getApiHost } from './urlUtil';

export const getAlias = (username) => {
    return username.split('@')[0];
}

export const refreshUserInfo = async (token) => {
    const response = await fetchWithToken(getApiHost() + "/getUserInfoWithToken", token?token:localStorage.getItem('usertoken'));
    const data = await response.json();
    const userInfo = await JSON.parse(data);
    if (userInfo.length>0)  {
        localStorage.setItem('userDetails', JSON.stringify(userInfo[0]));
    }
    return userInfo[0];
}