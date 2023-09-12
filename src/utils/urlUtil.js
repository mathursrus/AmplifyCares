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
    
    // return "http://localhost:8080";
    
    return "https://amplifycaresserver.azurewebsites.net";
}
