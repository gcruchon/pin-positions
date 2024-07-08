import { createContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { collection, where, query, onSnapshot, doc, getDoc } from 'firebase/firestore';

import { getLocalDateFromDb } from '../utils';
import { db } from '../firebase';
import { Round } from "./Round";

export const EventContext = createContext();

export const Event = () => {
    const { eventId } = useParams();

    const [displayedRound, setDisplayedRound] = useState(1);
    const [eventData, setEventData] = useState({});
    const [eventPageStatus, setEventPageStatus] = useState("syncing");
    const [holes, setHoles] = useState([]);

    const getActiveClass = (round) => {
        if (displayedRound === round) {
            return "active font-weight-bold"
        }
        return "";
    }
    useEffect(() => {
        setEventPageStatus("exists");
        const getEvent = async (eventId) => {
            const eventRef = doc(db, "events", eventId);
            const eventSnap = await getDoc(eventRef);
            if (eventSnap.exists()) {
                setEventData(eventSnap.data());
                setEventPageStatus("event-exists")
            } else {
                setEventPageStatus("not-found")
            }
        }
        getEvent(eventId);
    }, [eventId]);
    useEffect(() => {
        if (eventPageStatus === "event-exists") {
            const holesRef = collection(db, "holes");
            const q = query(holesRef, where("eventId", "==", eventId));
            const unsubscribe = onSnapshot(q,
                (querySnapshot) => {
                    let holes = {};
                    querySnapshot.forEach((doc) => {
                        holes[doc.id] = doc.data();
                    });
                    setHoles(holes);
                },
                (error) => {
                    console.error(error);
                });
            return () => unsubscribe();
        }
    }, [eventId, eventPageStatus]);

    return (
        <EventContext.Provider value={eventId}>
            <Container className={eventPageStatus === "event-exists" ? "" : "d-none"} fluid >
                <h2>
                    {eventData.name}
                    {' '}
                    <Link to={`/events/${eventId}/details`}>
                        <Button variant="outline-primary" size="sm" className="ms-2">Edit event</Button>
                    </Link>
                </h2>
                <Nav variant="tabs" defaultActiveKey="/">
                    {
                        eventData.rounds
                            ? eventData.rounds.map((round, i) => {
                                const roundIndex = i + 1;
                                return (
                                    <Nav.Item key={`navItem-round-${roundIndex}`}>
                                        <Nav.Link
                                            className={getActiveClass(roundIndex)}
                                            data-round={roundIndex}
                                            onClick={(e) => { setDisplayedRound(parseInt(e.target.dataset.round, 10)) }}>Round N°{roundIndex}</Nav.Link>
                                    </Nav.Item>
                                )
                            })
                            : ""
                    }
                </Nav>

                {
                    eventData.rounds
                        ? eventData.rounds.map((round, i) => {
                            const roundIndex = i + 1;
                            return (
                                <Round
                                    key={`round-${roundIndex}`}
                                    round={roundIndex}
                                    roundDate={getLocalDateFromDb(round.date)}
                                    dotColor={round.dotColor}
                                    isVisible={roundIndex === displayedRound}
                                    holes={holes} />
                            )

                        })
                        : <Alert variant="warning" className="mt-4">No round configured</Alert>
                }
            </Container>
            <Alert show={eventPageStatus === "light"} variant="danger">Loading event...</Alert>
            <Alert show={eventPageStatus === "not-found"} variant="danger">Event not found!</Alert>
        </EventContext.Provider>
    );
}