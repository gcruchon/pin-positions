import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useLocation } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import Button from "react-bootstrap/Button";

import { Hole } from "./Hole";

import './dots.css'
import './Pins.css'

export const Pins = () => {
    const { eventId } = useParams();
    const { hash } = useLocation();
    const { eventData, holes } = useOutletContext();
    const [rounds, setRounds] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setRounds(eventData.rounds);
    }, [eventData.rounds]);

    const activeHole = hash && hash.split("_").length
        ? parseInt(hash.split("_").pop(), 10)
        : 1;
    console.log(activeHole);

    return (
        <div className="mt-3">
            <h4>Enter pin positions</h4>
            <Accordion defaultActiveKey={activeHole} className="Pins">
                {
                    [...Array(18).keys()].map((i => {
                        return (
                            <Accordion.Item eventKey={i + 1} key={`accordion-${i + 1}`}>
                                <Accordion.Header className="fw-bold">Hole #{i + 1}</Accordion.Header>
                                <Accordion.Body>
                                    {
                                        rounds ?
                                            rounds.map((roundData, roundIndex) => {
                                                const round = roundIndex + 1;
                                                const hole = holes[`${eventId}|${round}|${i + 1}`] || {}
                                                return (<>
                                                    <Hole round={round} hole={i + 1} value={hole} key={`${round}-${i + 1}`} dotColor={roundData.dotColor} />
                                                </>);
                                            })
                                            : 'Loading'
                                    }
                                </Accordion.Body>

                            </Accordion.Item>
                        );
                    }))
                }
            </Accordion>
            <Button onClick={() => navigate(`/events/${eventId}/round/1/stats`)} size="sm" className="me-2 my-3">See R1 stats</Button>
            <Button onClick={() => navigate(`/events/${eventId}/round/1/rulings`)} size="sm" className="me-2 my-3">See R1 rulings</Button>

        </div>
    );
}