import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { collection, where, query, onSnapshot, or, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getLocalDateFromDb, dateOptions } from '../utils';
import { useAuth } from '../hooks';

export const EventList = () => {
    const { currentUser } = useAuth();

    const [events, setEvents] = useState([]);
    const [newEventName, setNewEventName] = useState("");
    const [newEventDateStart, setNewEventDateStart] = useState("");

    const createEvent = async () => {
        if (newEventName.trim() === "") {
            alert("You must enter a name for this new event.");
            return;
        }
        if (newEventDateStart === "") {
            alert("You must enter a start date for this new event.");
            return;
        }
        await addDoc(collection(db, "events"), {
            name: newEventName.trim(),
            dateStart: newEventDateStart,
            rounds: [{ date: newEventDateStart, dotColor: "white" }],
            owners: [currentUser.email],
            created: serverTimestamp(),
            createdBy: currentUser.email,
        });

    }

    useEffect(() => {
        if (currentUser && currentUser.email) {
            const eventsRef = collection(db, "events");
            const q = query(eventsRef, or(where("owners", "array-contains", currentUser.email), where("editors", "array-contains", currentUser.email)));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                let events = {};
                querySnapshot.forEach((doc) => {
                    events[doc.id] = doc.data();
                });
                setEvents(events);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    return (
        <Container fluid>
            <h2>Event list</h2>
            <p>Please select an event below:</p>
            <div className="list-group">
                {
                    Object.keys(events).length
                        ? Object.keys(events).map((eventId) => (
                            <Link to={`/events/${eventId}`} className="list-group-item list-group-item-action" key={`events-${eventId}`}>
                                {events[eventId].name} - {getLocalDateFromDb(events[eventId].dateStart).toLocaleDateString("en-GB", dateOptions)}
                            </Link>
                        ))
                        : <div>No events</div>
                }
            </div>
            <hr />
            <h2>Create new event</h2>
            <InputGroup className="mb-3">
                <InputGroup.Text className="">New event name</InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="New event name"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                />
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text className="">New event start date</InputGroup.Text>
                <Form.Control
                    type="date"
                    placeholder="New event name"
                    value={newEventDateStart}
                    onChange={(e) => setNewEventDateStart(e.target.value)}
                />
            </InputGroup>
            <Button variant="outline-primary" onClick={() => createEvent()}>Create Event</Button>
        </Container>
    );
}