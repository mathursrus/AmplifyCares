export const ago = (beginningDate, days) => {
    return beginningDate - (days * 24 * 60 * 60 * 1000);
}

export const ahead = (beginningDate, days) => {
    return beginningDate + (days * 24 * 60 * 60 * 1000);
}