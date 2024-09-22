import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from "react-bootstrap/Button";

import { Hole } from "./Hole";
import { getLocalDateFromDb, dateOptions } from '../utils';

import './Round.css'

export const Round = () => {
    const { eventId, round } = useParams();
    const { eventData, holes } = useOutletContext();
    const [roundData, setRoundData] = useState({ roundDate: null, dotColor: null });
    const navigate = useNavigate();

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
                    ? <div>
                        <p className="my-3">
                            {'Date: '}
                            <span className="fw-bold">
                                {getLocalDateFromDb(roundData.date).toLocaleDateString("en-GB", dateOptions)}
                            </span>
                            {' - Dots: '}
                            <span className={`fw-bold py-1 px-2 rounded-pill Round-${roundData.dotColor}`}>{roundData.dotColor}</span>
                        </p>

                        {
                            [...Array(18).keys()].map((i => {
                                const hole = holes[`${eventId}|${round}|${i + 1}`] || {}
                                return (<Hole hole={i + 1} value={hole} key={`${round}-${i + 1}`} />);
                            }))
                        }
                        <Button onClick={() => navigate(`/events/${eventId}/round/${round}/stats`)} size="sm" className="me-2 my-3">See stats</Button>
                        <Button onClick={() => navigate(`/events/${eventId}/round/${round}/rulings`)} size="sm" className="me-2 my-3">See rulings</Button>
                    </div>
                    : <Alert variant="warning" className="mt-4">No round configured</Alert>
            }

        </>
    );
}