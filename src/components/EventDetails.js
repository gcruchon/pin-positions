import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

import { db } from '../firebase';
import { useAuth } from '../hooks';
import { getLocalDateFromDb, getDbDateFromLocalDate, validateEmail } from '../utils';
import './EventDetails.css';

export const EventDetails = () => {
    const { eventId } = useParams();
    const { currentUser } = useAuth();

    const [eventData, setEventData] = useState({});
    const [eventPageStatus, setEventPageStatus] = useState("syncing");
    const [newOwnerEmail, setNewOwnerEmail] = useState("");
    const [newEditorEmail, setNewEditorEmail] = useState("");
    const [showToast, setShowToast] = useState(false);


    const addRound = async () => {
        let { dateStart, rounds } = eventData;
        let nextRoundDate = getLocalDateFromDb(dateStart);

        if (rounds && rounds.length) {
            const oneDay = 24 * 60 * 60 * 1000;
            nextRoundDate.setTime(getLocalDateFromDb(rounds[rounds.length - 1].date).getTime() + oneDay);
        } else {
            rounds = [];
        }
        const udpdatedFragment = {};
        udpdatedFragment["rounds"] = [...rounds, { date: getDbDateFromLocalDate(nextRoundDate), dotColor: "white" }];
        await updateEvent(udpdatedFragment);
    }

    const removeRound = async (roundIndex) => {
        const { rounds } = eventData;
        rounds.splice(roundIndex - 1, 1);
        const udpdatedFragment = { rounds };
        await updateEvent(udpdatedFragment);
    };

    const saveRoundField = async (newValue, field, roundIndex) => {
        const { rounds } = eventData;
        const i = roundIndex - 1;
        const round = rounds[i];

        round[field] = newValue;
        rounds.splice(i, 1, round);
        const udpdatedFragment = { rounds };
        await updateEvent(udpdatedFragment);

    };

    const saveRoundDate = async (newDate, roundIndex) => {
        await saveRoundField(newDate, "date", roundIndex);
    };

    const saveRoundDotColor = async (newDotColor, roundIndex) => {
        await saveRoundField(newDotColor, "dotColor", roundIndex);
    };

    const addMember = async (email, field) => {
        const members = eventData[field] || [];
        members.push(email);
        const udpdatedFragment = {};
        udpdatedFragment[field] = members;
        await updateEvent(udpdatedFragment);
    }

    const removeMember = async (email, field) => {
        const members = eventData[field] || [];
        const udpdatedFragment = {};
        udpdatedFragment[field] = members.filter((memberEmail) => memberEmail !== email);
        await updateEvent(udpdatedFragment);
    }

    const addEditor = async () => {
        if (validateEmail(newEditorEmail)) {
            await addMember(newEditorEmail, "editors");
            setNewEditorEmail("");
        } else {
            alert(`New editor email is invalid: ${newEditorEmail}`);
        }
    }

    const addOwner = async () => {
        if (validateEmail(newOwnerEmail)) {
            await addMember(newOwnerEmail, "owners");
            setNewOwnerEmail("");
        } else {
            alert(`New owner email is invalid: ${newOwnerEmail}`);
        }
    }

    const removeEditor = async (editorEmail) => {
        await removeMember(editorEmail, "editors");
    }

    const removeOwner = async (ownerEmail) => {
        await removeMember(ownerEmail, "owners");
    }

    const saveEventName = async (newEventName) => {
        await updateEvent({ name: newEventName });
    }

    const saveEventStartDate = async (newEventDbDate) => {
        await updateEvent({ dateStart: newEventDbDate });
    }

    const updateEvent = async (updatedFragment) => {
        setShowToast(true);
        const eventRef = doc(db, "events", eventId);
        updatedFragment["updated"] = serverTimestamp();
        updatedFragment["updatedBy"] = currentUser.email;
        await updateDoc(eventRef, updatedFragment);
        setShowToast(false);
    }

    useEffect(() => {
        const eventRef = doc(db, "events", eventId);
        const unsubscribe = onSnapshot(eventRef, (doc) => {
            if (doc.data()) {
                setEventData(doc.data());
                setEventPageStatus("event-exists")
            } else {
                setEventPageStatus("not-found")
            }
        });
        return () => unsubscribe();
    }, [eventId]);

    return (
        <>
            <Container className={eventPageStatus === "event-exists" ? "" : "d-none"} fluid>
                <div className="d-flex flex-row">
                    <div className="p-2">
                        <h5>Event details</h5>
                    </div>
                    <div className={showToast ? "p-2" : "d-none"}>
                        [Saving...]
                    </div>
                </div>
                <Form>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="2">
                            Name
                        </Form.Label>
                        <Col sm="10">
                            <Form.Control
                                type="text"
                                placeholder="Name of the event"
                                defaultValue={eventData.name || ""}
                                onBlur={(e) => saveEventName(e.target.value)} />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="2">
                            First day of the event
                        </Form.Label>
                        <Col sm="10">
                            <Form.Control
                                type="date"
                                placeholder=""
                                value={eventData.dateStart || ""}
                                onChange={(e) => saveEventStartDate(e.target.value)} />
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
                                                <Form.Control
                                                    type="date"
                                                    data-round={roundIndex}
                                                    defaultValue={round.date}
                                                    onChange={(e) => saveRoundDate(e.target.value, e.target.dataset.round)} />
                                            </InputGroup>
                                        </Col>
                                        <Col>
                                            <InputGroup className="mb-3">
                                                <InputGroup.Text>Dot color</InputGroup.Text>
                                                <Form.Select
                                                    aria-label="Round color"
                                                    data-round={roundIndex}
                                                    defaultValue={round.dotColor}
                                                    onChange={(e) => saveRoundDotColor(e.target.value, e.target.dataset.round)}>
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
                    <hr />
                    <h5>Autorisations</h5>

                    <ListGroup className="mb-4">
                        {
                            eventData.owners
                                ? eventData.owners.map((ownerEmail, i) => {
                                    return (<ListGroup.Item variant="primary" key={`owner-${i}`}>
                                        <Badge bg="primary">owner</Badge>
                                        {' '}
                                        {ownerEmail}
                                        {' '}
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            data-email={ownerEmail}
                                            onClick={(e) => removeOwner(e.target.dataset.email)}>Remove</Button>
                                    </ListGroup.Item>)
                                })
                                : ""
                        }
                        {
                            eventData.editors
                                ? eventData.editors.map((editorEmail, i) => {
                                    return (<ListGroup.Item variant="light" key={`editor-${i}`}>
                                        <Badge bg="secondary">editor</Badge>
                                        {' '}
                                        {editorEmail}
                                        {' '}
                                        <Button
                                            variant="outline-dark"
                                            size="sm"
                                            data-email={editorEmail}
                                            onClick={(e) => removeEditor(e.target.dataset.email)}>Remove</Button>
                                    </ListGroup.Item>)
                                })
                                : ""
                        }
                    </ListGroup>
                    <InputGroup className="mb-3 EventDetails-owner">
                        <InputGroup.Text className="">New owner</InputGroup.Text>
                        <Form.Control
                            type="email"
                            placeholder="Owner email"
                            value={newOwnerEmail}
                            onChange={(e) => setNewOwnerEmail(e.target.value)}
                        />
                        <Button variant="outline-primary" onClick={() => addOwner()}>Add</Button>
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>New editor</InputGroup.Text>
                        <Form.Control
                            type="email"
                            placeholder="Editor email"
                            value={newEditorEmail}
                            onChange={(e) => setNewEditorEmail(e.target.value)}
                        />
                        <Button variant="outline-secondary" onClick={() => addEditor()}>Add</Button>
                    </InputGroup>
                    <Container className="my-4" fluid>
                        <Link to={`/events/${eventId}`}>
                            <Button variant="outline-secondary">Edit pin positions</Button>
                        </Link>
                    </Container>
                </Form>
            </Container>
            <Alert show={eventPageStatus === "syncing"} variant="warning">Loading event...</Alert>
            <Alert show={eventPageStatus === "not-found"} variant="danger">Event not found!</Alert>
        </>
    );
}