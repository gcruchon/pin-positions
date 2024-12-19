import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { Trash } from 'react-bootstrap-icons';

import { collection, onSnapshot, query, where, and, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks';

import { db } from '../firebase';

export const RoundDraw = () => {
    const { currentUser } = useAuth();
    const { eventId, round } = useParams();

    const emptyDraw = {
        eventId,
        round: parseInt(round, 10),
        startingTee: 1,
        startingInterval: 11,
        startingTime: "08:00",
        numberOfGroups: ""
    };

    const [courses, setCourses] = useState({});
    const [draws, setDraws] = useState([]);
    const [newDraw, setNewDraw] = useState(emptyDraw);
    const [showToast, setShowToast] = useState(false);

    const getLastTeeTimeForDraw = (draw) => {
        if (draw.startingTime && draw.numberOfGroups && draw.startingInterval) {
            const firstTeeTime = new Date(`2024-01-01T${draw.startingTime}:00`);
            const lastTeeTime = new Date(firstTeeTime.getTime() + ((draw.numberOfGroups - 1) * draw.startingInterval * 60000));
            return lastTeeTime.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' });
        } else {
            return "N/A";
        }
    }

    const keepNumberOnly = (value) => {
        return value.replace(/\D/g, '');
    }

    const updateNewDrawField = (value, field) => {
        const updatedNewDraw = { ...newDraw };
        if (field === "courseId" || field === "startingTime") {
            updatedNewDraw[field] = value.trim();
        } else {
            if (keepNumberOnly(value) === "") {
                updatedNewDraw[field] = "";
            } else {
                updatedNewDraw[field] = parseInt(keepNumberOnly(value), 10);
            }
        }
        setNewDraw(updatedNewDraw);
    }

    const deleteDraw = async (drawId, startingTime) => {
        if( window.confirm(`Are you sure you want to delete the "${startingTime}" draw?\nThis action cannot be undone.`) ) {
            setShowToast(true);
            await deleteDoc(doc(db, "draws", drawId));
            setShowToast(false);
        }
    }

    const addDraw = async () => {
        if (!newDraw.courseId) {
            alert("You must enter a golf course for this new draw.");
            return;
        }
        if (!newDraw.startingTee) {
            alert("You must enter a starting tee for this new draw.");
            return;
        }
        if (isNaN(newDraw.startingTee)) {
            alert("You must enter a number for this new course.");
            return;
        }
        if (newDraw.startingTee < 1 && newDraw.startingTee > 18) {
            alert("You must enter a starting tee between 1 and 18.");
            return;
        }
        if (!newDraw.startingInterval) {
            alert("You must enter a starting interval for this new draw.");
            return;
        }
        if (isNaN(newDraw.startingInterval)) {
            alert("You must enter a number for this new course.");
            return;
        }
        if (!newDraw.startingTime) {
            alert("You must enter a starting time for this new draw.");
            return;
        }
        if (!newDraw.numberOfGroups) {
            alert("You must enter a number of groups for this new draw.");
            return;
        }
        if (isNaN(newDraw.numberOfGroups)) {
            alert("You must enter a number for this new course.");
            return;
        }
        setShowToast(true);
        await addDoc(collection(db, "draws"), {
            ...newDraw,
            created: serverTimestamp(),
            createdBy: currentUser.email,
        });
        setShowToast(false);
        setNewDraw(emptyDraw);
    }

    useEffect(() => {
        const coursesRef = collection(db, "courses");
        const unsubscribe = onSnapshot(coursesRef, (querySnapshot) => {
            let courses = {};
            querySnapshot.forEach((doc) => {
                courses[doc.id] = doc.data();
            });
            setCourses(courses);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const drawsRef = collection(db, "draws");
        const q = query(drawsRef, and(where("eventId", "==", eventId), where("round", "==", parseInt(round, 10))), orderBy("startingTime", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let drawsFromDb = {};

            querySnapshot.forEach((doc) => {
                drawsFromDb[doc.id] = doc.data();
            });
            setDraws(drawsFromDb);
        });
        return () => unsubscribe();
    }, [eventId, round]);

    return (
        <Container fluid>
            {
                draws && Object.keys(draws).length
                    ? (<>
                        <div className="d-flex flex-row">
                            <h5>Current draws</h5>
                            <div className={showToast ? "ps-2" : "d-none"}>
                                [Saving...]
                            </div>
                        </div>
                        {
                            Object.keys(draws).map((drawId) => (
                                <Card key={`draw-${drawId}`} className="my-3">
                                    <Card.Header className="fw-bold">
                                        Draw starting at {draws[drawId].startingTime}
                                        <Button
                                            variant="outline-primary"
                                            className="ms-2"
                                            size="sm"
                                            onClick={(e) => deleteDraw(drawId, draws[drawId].startingTime)}>
                                            <Trash />
                                            <span className="visually-hidden">Remove draw</span>
                                        </Button>
                                    </Card.Header>
                                    <Card.Body>
                                        <div>Course: {courses[draws[drawId].courseId].golfClubName} - {courses[draws[drawId].courseId].courseName}</div>
                                        <div>Starting tee: # {draws[drawId].startingTee}</div>
                                        <div>Starting interval: {draws[drawId].startingInterval} min.</div>
                                        <div>Number of groups: {draws[drawId].numberOfGroups}</div>
                                        <div>Last tee time: {getLastTeeTimeForDraw(draws[drawId])}</div>
                                    </Card.Body>

                                </Card>
                            ))
                        }
                    </>)
                    : <Alert variant="warning" className="my-4">No draws for this round</Alert>
            }

            <div className="d-flex flex-row">
                <h5>Add a new draw</h5>
                <div className={showToast ? "ps-2" : "d-none"}>
                    [Saving...]
                </div>
            </div>
            <InputGroup className="mb-3">
                <InputGroup.Text>Course</InputGroup.Text>
                <Form.Select
                    aria-label="Golf course for the round"
                    value={newDraw.courseId}
                    onChange={(e) => updateNewDrawField(e.target.value, "courseId")}>
                    <option value="" key="option-empty">Select a golf course</option>
                    {
                        Object.keys(courses).length
                            ? Object.keys(courses).map((courseId) => (
                                (<option value={courseId} key={`option-${courseId}`}>
                                    {courses[courseId].golfClubName} - {courses[courseId].courseName}
                                </option>)
                            ))
                            : ''
                    }
                </Form.Select>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>Starting tee</InputGroup.Text>
                <Form.Control
                    type="text"
                    size="3"
                    value={newDraw.startingTee}
                    placeholder="1 or 10"
                    onChange={(e) => updateNewDrawField(e.target.value, "startingTee")} />
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>Starting intervals</InputGroup.Text>
                <Form.Control
                    type="text"
                    size="3"
                    placeholder="10 or more (11 recommanded)"
                    value={newDraw.startingInterval}
                    onChange={(e) => updateNewDrawField(e.target.value, "startingInterval")} />
                <InputGroup.Text>min.</InputGroup.Text>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>Starting time</InputGroup.Text>

                <Form.Control
                    type="time"
                    placeholder="time"
                    value={newDraw.startingTime}
                    onChange={(e) => updateNewDrawField(e.target.value, "startingTime")} />
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text>Number of groups</InputGroup.Text>
                <Form.Control
                    type="text"
                    size="3"
                    placeholder="Enter a number"
                    value={newDraw.numberOfGroups}
                    onChange={(e) => updateNewDrawField(e.target.value, "numberOfGroups")} />
            </InputGroup>
            <div className="my-3">For information, last tee time for this new draw will be: {getLastTeeTimeForDraw(newDraw)}</div>
            <Button variant="primary" className="my-3" onClick={() => addDraw()}>Add draw</Button>
        </Container>
    );
}