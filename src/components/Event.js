import { useState, useEffect } from 'react';
import { useParams, Link, Outlet, useNavigate, useResolvedPath } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { collection, where, query, onSnapshot, doc, getDoc, and, orderBy } from 'firebase/firestore';

import { db } from '../firebase';
import { Pencil } from 'react-bootstrap-icons';

export const Event = () => {
    const { eventId, round: displayedRound } = useParams();
    const navigate = useNavigate();
    const path = useResolvedPath();

    const [eventData, setEventData] = useState({});
    const [eventPageStatus, setEventPageStatus] = useState("syncing");
    const [holes, setHoles] = useState([]);
    const [rulings, setRulings] = useState([]);
    const [referees, setReferees] = useState([]);
    const [suffix, setSuffix] = useState('');

    const selectRound = (round) => {
        navigate(`/events/${eventId}/round/${round}${suffix}`);
    };

    useEffect(() => {
        if (path.pathname.slice(-6) === "/stats") {
            setSuffix("/stats");
        } else if (path.pathname.slice(-8) === "/rulings") {
            setSuffix("/rulings");
        } else if (path.pathname.slice(-5) === "/draw") {
            setSuffix("/draw");
        } else if (path.pathname.slice(-10) === "/timesheet") {
            setSuffix("/timesheet");
        } else {
            setSuffix("");
        }
    }, [path]);

    useEffect(() => {
        setEventPageStatus("exists");
        const getEvent = async (eventId) => {
            const eventRef = doc(db, "events", eventId);
            const eventDoc = await getDoc(eventRef);
            if (eventDoc.exists()) {
                setEventData(eventDoc.data());
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

    useEffect(() => {
        if (eventPageStatus === "event-exists") {
            const refereesRef = collection(db, "users");
            const unsubscribe = onSnapshot(refereesRef,
                (querySnapshot) => {
                    let referees = {};
                    querySnapshot.forEach((doc) => {
                        referees[doc.id] = doc.data();
                    });
                    setReferees(referees);
                },
                (error) => {
                    console.error(error);
                });
            return () => unsubscribe();
        }
    }, [eventId, eventPageStatus]);

    useEffect(() => {
        if (eventPageStatus === "event-exists") {
            const rulingsRef = collection(db, "rulings");
            const q = query(rulingsRef, and(where("eventId", "==", eventId), where("deleted", "==", false)), orderBy("ruledAt", "asc"));
            const unsubscribe = onSnapshot(q,
                (querySnapshot) => {
                    let rulings = {};
                    querySnapshot.forEach((doc) => {
                        rulings[doc.id] = doc.data();
                    });
                    setRulings(rulings);
                },
                (error) => {
                    console.error(error);
                });
            return () => unsubscribe();
        }
    }, [eventId, eventPageStatus]);

    return (
        <>
            <Container className={eventPageStatus === "event-exists" ? "" : "d-none"} fluid >
                <h2>
                    {eventData.name}
                    {' '}
                    <Link to={`/events/${eventId}/details`}>
                        <Button variant="outline-primary" size="sm" className="ms-2">
                            <Pencil />
                            <span className="visually-hidden">Edit event</span>
                        </Button>
                    </Link>
                </h2>
                <Nav variant="tabs" defaultActiveKey="/">
                    <Nav.Item key="navItem-pins">
                        <Nav.Link
                            className={
                                isNaN(displayedRound)
                                    ? "active font-weight-bold"
                                    : ""
                            }
                            onClick={(e) => navigate(`/events/${eventId}/pins`)}>All rounds</Nav.Link>
                    </Nav.Item>
                    {
                        eventData.rounds
                            ? eventData.rounds.map((round, i) => {
                                const roundIndex = i + 1;
                                return (
                                    <Nav.Item key={`navItem-round-${roundIndex}`}>
                                        <Nav.Link
                                            className={
                                                !isNaN(displayedRound) && parseInt(displayedRound, 10) === roundIndex
                                                    ? "active font-weight-bold"
                                                    : ""
                                            }
                                            data-round={roundIndex}
                                            onClick={(e) => { selectRound(e.target.dataset.round) }}>Round N°{roundIndex}</Nav.Link>
                                    </Nav.Item>
                                )
                            })
                            : ""
                    }
                </Nav>

                <Outlet context={{ eventId, eventData, holes, rulings, referees }} />
            </Container>
            <Alert show={eventPageStatus === "light"} variant="danger">Loading event...</Alert>
            <Alert show={eventPageStatus === "not-found"} variant="danger">Event not found!</Alert>
        </>
    );
}