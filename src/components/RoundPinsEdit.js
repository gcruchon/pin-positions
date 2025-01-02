import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router';

import { Hole } from "./Hole";

import './dots.css'

export const RoundPinsEdit = () => {
    const { eventId, round } = useParams();
    const { eventData, holes } = useOutletContext();
    const [roundData, setRoundData] = useState({ roundDate: null, dotColor: null });

    useEffect(() => {
        const roundIndex = isNaN(round)
            ? 0
            : parseInt(round, 10);
        if (roundIndex > 0 && eventData.rounds && eventData.rounds.length >= roundIndex) {
            setRoundData(eventData.rounds[roundIndex - 1]);
        }
    }, [eventData.rounds, round]);


    return (
        <>
            {
                roundData.date
                    ? <>
                        {
                            [...Array(18).keys()].map((i => {
                                const hole = holes[`${eventId}|${round}|${i + 1}`] || {}
                                return (<Hole round={round} hole={i + 1} value={hole} key={`${round}-${i + 1}`} />);
                            }))
                        }
                    </>
                    : ""
            }

        </>
    );
}