import { createContext, useContext } from 'react';
import { EventContext } from "./Event";
import { Hole } from "./Hole";
import { dateOptions } from '../utils';

export const RoundContext = createContext();

export const Round = ({ round, roundDate, dotColor, isVisible, holes }) => {
    const eventId = useContext(EventContext);

    const holeComponents = [];
    for (let i = 1; i <= 18; i++) {
        const hole = holes[`${eventId}|${round}|${i}`] || {}
        holeComponents.push(<Hole hole={i} value={hole} key={`${round}-${i}`} />);
    }

    const visibilityClass = isVisible ? "" : "d-none";

    return (
        <RoundContext.Provider value={round}>
            <div className={visibilityClass}>
                <p>Date: {roundDate.toLocaleDateString("en-GB", dateOptions)} - Dot color: {dotColor}</p>
                {holeComponents}
            </div>
        </RoundContext.Provider>
    );
}