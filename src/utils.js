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