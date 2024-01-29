export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


export const getApiUrl = (path) => {
    return `${getApiHost()}${path}`;
}

export const isValidURL = (url) => {
    try {
        new URL(url);
        console.log("Valid ", url);
        return true;
    } catch (error) {
        return false;
    }
}

export const getApiHost = () => {
    // return window.location.href.indexOf('localhost') !== -1 ? "http://localhost:8080" : "https://amplifycaresserver.azurewebsites.net";
    if (localStorage.getItem('userName') === null || localStorage.getItem('userName') === '')  {
        window.location.reload();
    }
    
    //return "http://localhost:8080";
    
    return "https://amplifycaresserver.azurewebsites.net";
}

export const fetchAndInsertToken = async (endpoint) => {
  return fetchWithToken(endpoint, localStorage.getItem('usertoken'));
}

export const fetchWithToken = async (endpoint, token) => {
    const requestOptions = {
        method: 'GET', 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      return fetch(endpoint, requestOptions);
}

export const postWithToken = async (endpoint, object, token) => {     
    const requestBody = {};
    requestBody.item = object;
    const requestOptions = {
        method: "POST", 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      };
      return fetch(getApiUrl(endpoint), requestOptions);
}

export const postWithBodyAndToken = async (endpoint, body, token) => {         
    const requestOptions = {
        method: "POST", 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      };
      return fetch(getApiUrl(endpoint), requestOptions);
}