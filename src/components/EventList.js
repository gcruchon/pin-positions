import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import { collection, where, query, onSnapshot, or } from 'firebase/firestore';
import { db } from '../firebase';
import { getLocalDateFromDb, dateOptions } from '../utils';
import { AppContext } from '../App';

export const EventList = () => {
    const currentUser = useContext(AppContext);

    const [events, setEvents] = useState([]);

    useEffect(() => {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, or(where("owners", "array-contains", currentUser.email),where("editors", "array-contains", currentUser.email)));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let events = {};
            querySnapshot.forEach((doc) => {
                events[doc.id] = doc.data();
            });
            setEvents(events);
            console.log("events", events);
        });
        return () => unsubscribe();
    }, [currentUser.email]);

    return (
        <Container fluid>
            <h1>Event list</h1>
            <p>Please select an event below:</p>
            <div class="list-group">
                {
                    Object.keys(events).length
                        ? Object.keys(events).map((eventId) => (
                            <Link to={`/events/${eventId}`} className="list-group-item list-group-item-action">
                                {events[eventId].name} - {getLocalDateFromDb(events[eventId].dateStart).toLocaleDateString("en-GB", dateOptions)}
                            </Link>
                        ))
                        : <div>No events</div>
                }
            </div>
        </Container>
    );
}