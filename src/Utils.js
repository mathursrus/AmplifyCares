import { getApiHost } from "./utils/urlUtil";

function getServerString() {
    return getApiHost();
}

export default getServerString;