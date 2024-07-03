import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../firebase';
import { getLocalDateFromDb, getDbDateFromLocalDate } from '../utils';

export const EventDetails = () => {
    const { eventId } = useParams();

    const [eventData, setEventData] = useState({});
    const [eventPageStatus, setEventPageStatus] = useState("syncing");
    const [showToast, setShowToast] = useState(false);


    const addRound = () => {
        let { dateStart, name, rounds } = eventData;
        let nextRoundDate = getLocalDateFromDb(dateStart);

        if (rounds && rounds.length) {
            const oneDay = 24 * 60 * 60 * 1000;
            nextRoundDate.setTime(getLocalDateFromDb(rounds[rounds.length - 1].date).getTime() + oneDay);
            console.log("nextRoundDate", nextRoundDate);
        } else {
            rounds = [];
        }
        const newEventData = {
            name,
            dateStart,
            rounds: [...rounds, { date: getDbDateFromLocalDate(nextRoundDate), dotColor: "white" }]
        }
        setEventData(newEventData);
    }

    const removeRound = (roundIndex) => {
        const { dateStart, name, rounds } = eventData;
        rounds.splice(roundIndex - 1, 1);
        const newEventData = {
            name,
            dateStart,
            rounds,
        }
        setEventData(newEventData);
    };

    const saveEvent = async () => {
        setShowToast(true);
        const eventRef = doc(db, "events", eventId);
        const res = await updateDoc(eventRef, { ...eventData, updated: serverTimestamp() });
        console.log(res)
        setShowToast(false);
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

    return (
        <>
            <Container show={eventPageStatus === "event-exists"} fluid>
                <Form>
                    <h5>Event details</h5>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="2">
                            Name
                        </Form.Label>
                        <Col sm="10">
                            <Form.Control type="text" placeholder="Name of the event" defaultValue={eventData.name} />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="2">
                            First day of the event
                        </Form.Label>
                        <Col sm="10">
                            <Form.Control type="date" placeholder="" defaultValue={eventData.dateStart} />
                        </Col>
                    </Form.Group>
                    <hr />
                    <div className="d-flex flex-row">
                        <div className="p-2">
                            <h5>Rounds</h5>
                        </div>
                        <div className="p-2">
                            <Button variant="outline-primary" size="sm" onClick={() => addRound()}>Add round</Button>
                        </div>
                    </div>
                    {
                        eventData.rounds
                            ? eventData.rounds.map((round, i) => {
                                const roundIndex = i + 1;
                                return (
                                    <Row key={`round-detail-${roundIndex}-${round.date}`}>
                                        <Col>Round {roundIndex}</Col>
                                        <Col>
                                            <InputGroup className="mb-3">
                                                <InputGroup.Text>Date</InputGroup.Text>
                                                <Form.Control type="date" defaultValue={round.date} />
                                            </InputGroup>
                                        </Col>
                                        <Col>
                                            <InputGroup className="mb-3">
                                                <InputGroup.Text>Dot color</InputGroup.Text>
                                                <Form.Select aria-label="Round color" defaultValue={round.dotColor}>
                                                    <option value="white">white</option>
                                                    <option value="red">red</option>
                                                    <option value="yellow">yellow</option>
                                                    <option value="blue">blue</option>
                                                </Form.Select>
                                            </InputGroup>
                                        </Col>
                                        <Col>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                data-round={roundIndex}
                                                onClick={(e) => removeRound(parseInt(e.target.dataset.round, 10))}>Remove round</Button>
                                        </Col>
                                    </Row>);
                            })
                            : ""
                    }
                    <Row>
                        <Col>
                            <Button variant="primary" onClick={() => saveEvent()}>Save event</Button>
                            {' '}
                            <Link to={`/events/${eventId}`}>
                                <Button variant="outline-secondary">Edit pin positions</Button>
                            </Link>
                            <Alert show={showToast} variant="light">Saving event...</Alert>
                        </Col>
                    </Row>
                </Form>
            </Container>
            <Alert show={eventPageStatus === "light"} variant="danger">Loading event...</Alert>
            <Alert show={eventPageStatus === "not-found"} variant="danger">Event not found!</Alert>
        </>
    );
}