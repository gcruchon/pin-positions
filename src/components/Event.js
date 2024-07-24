import { useState, useEffect } from 'react';
import { useParams, Link, Outlet, useNavigate, useResolvedPath } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { collection, where, query, onSnapshot, doc, getDoc } from 'firebase/firestore';

import { db } from '../firebase';

export const Event = () => {
    const { eventId, round: displayedRound } = useParams();
    const navigate = useNavigate();
    const path = useResolvedPath();

    const [eventData, setEventData] = useState({});
    const [eventPageStatus, setEventPageStatus] = useState("syncing");
    const [holes, setHoles] = useState([]);
    const [suffix, setSuffix] = useState('');

    const selectRound = (round) => {
        navigate(`/events/${eventId}/round/${round}${suffix}`);
    };



    useEffect(() => {
        setSuffix(
            path.pathname.slice(-6) === "/stats"
                ? "/stats"
                : ""
        )
    }, [path]);

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
        <>
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

                <Outlet context={{ eventId, eventData, holes }} />
            </Container>
            <Alert show={eventPageStatus === "light"} variant="danger">Loading event...</Alert>
            <Alert show={eventPageStatus === "not-found"} variant="danger">Event not found!</Alert>
        </>
    );
}