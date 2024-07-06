export const getEmptyData = (eventId, numberOfRounds) => {
    const emptyData = {}
    for (let r = 1; r <= numberOfRounds; r++) {
        for (let h = 1; h <= 18; h++) {
            emptyData[`${eventId}|${r}|${h}`] = {
                eventId,
                round: r,
                hole: h,
            };
        }
    }
    return emptyData;
}

export const getLocalISOstringFromDb = (dateFromDb) => {
    return `${dateFromDb}T00:00:00`;
}

export const getLocalDateFromDb = (dateFromDb) => {
    return new Date(getLocalISOstringFromDb(dateFromDb));
}

export const getDbDateFromLocalDate = (localDate) => {
    const mm = `0${localDate.getMonth() + 1}`.slice(-2);
    const dd = `0${localDate.getDate()}`.slice(-2);
    return `${localDate.getFullYear()}-${mm}-${dd}`;
}

export const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};
