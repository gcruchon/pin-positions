import { createContext, useContext } from 'react';
import { EventContext } from "./Event";
import { Hole } from "./Hole";
import { dateOptions } from '../utils';

import './Round.css'

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
                <p className="my-3">
                    {'Date: '}
                    <span className="fw-bold">
                        {roundDate.toLocaleDateString("en-GB", dateOptions)}
                    </span>
                    {' - Dots: '}
                    <span className={`fw-bold py-1 px-2 rounded-pill Round-${dotColor}`}>{dotColor}</span>
                </p>
                {holeComponents}
            </div>
        </RoundContext.Provider>
    );
}