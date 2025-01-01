import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { collection, onSnapshot, query, where, and, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../firebase';
import { useAuth } from '../hooks';

import './RoundTimesheet.css'


const UpdateTimeModal = ({ handleCloseTime, timesheets, saveTimesheet, drawId, teeTime, hole }) => {
    const [groupNumber, setGroupNumber] = useState(null);
    const [expected, setExpected] = useState(null);
    const [actual, setActual] = useState(null);
    const [comment, setComment] = useState('');

    const saveTime = async () => {
        const newTimesheets = { ...timesheets };
        newTimesheets[drawId][teeTime].timing[hole].actual = actual;
        newTimesheets[drawId][teeTime].timing[hole].comment = '' + comment;
        saveTimesheet(drawId, newTimesheets[drawId]);
        handleCloseTime();
    }

    useEffect(() => {
        const groupNumber = timesheets[drawId][teeTime].groupNumber;
        setGroupNumber(groupNumber);
        let { expected, actual, comment } = timesheets[drawId][teeTime].timing[hole];
        setExpected(expected);
        if (!actual) {
            actual = expected;
        }
        setActual(actual);
        if( comment ) {
            setComment(comment);
        }
    }, [drawId, hole, teeTime, timesheets]);

    return (
        <>
            <Modal.Header closeButton>
                <Modal.Title>
                    Group #{groupNumber}
                    {' - '}
                    {
                        hole === 'start'
                            ? 'Tee time'
                            : hole === 'recording'
                                ? 'Recording'
                                : `Hole #${hole}`
                    }
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Expected</InputGroup.Text>
                    <InputGroup.Text className="fw-bold">{expected}</InputGroup.Text>
                </InputGroup>
                <InputGroup className="mb-3">
                    <InputGroup.Text>Actual</InputGroup.Text>
                    <Form.Control
                        type="time"
                        placeholder="time"
                        value={actual}
                        onChange={(e) => setActual(e.target.value)} />
                </InputGroup>
                <InputGroup>
                    <InputGroup.Text>Comment</InputGroup.Text>
                    <Form.Control
                        as="textarea"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)} />
                </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={e => handleCloseTime()}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={e => saveTime()}>Save</Button>
            </Modal.Footer>
        </>
    )
}

const TimingForHole = ({ timing }) => {
    const [diff, setDiff] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (timing.actual) {
            const expectedTime = new Date(`2025-01-01T${timing.expected}:00`);
            const actualTime = new Date(`2025-01-01T${timing.actual}:00`);
            const diffInMinutes = Math.trunc((actualTime - expectedTime) / (60 * 1000));
            setDiff(diffInMinutes);
        } else {
            setDiff(null);
        }
        if (timing.comment && timing.comment.trim() !== '') {
            setComment(timing.comment.trim());
        } else {
            setComment('');
        }
    }, [timing]);

    return (
        <span className={
            diff === null
                ? ''
                : diff > 0
                    ? 'Timesheet-late' : 'Timesheet-on-time'
        }>
            {
                timing.actual
                    ? `${timing.actual} (${diff > 0 ? '+' : ''}${diff})`
                    : timing.expected
            }
            {
                comment !== ''
                    ? (
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Tooltip>
                                    {
                                        comment.split('\n').map((line, index) => (
                                            <div className="text-start" key={`comment-${index}`}>{line}</div>
                                        ))
                                    }
                                </Tooltip>
                            }
                        >
                            <span className="ms-2 ">⚠️</span>
                        </OverlayTrigger>
                    )
                    : ''
            }
        </span>)
}

export const RoundTimesheet = () => {

    const { currentUser } = useAuth();
    const { eventId, round } = useParams();

    const [courses, setCourses] = useState({});
    const [draws, setDraws] = useState([]);
    const [timesheets, setTimesheets] = useState([]);
    const [showTime, setShowTime] = useState(false);
    const [currentlyEditing, setCurrentlyEditing] = useState({ drawId: null, teeTime: null, hole: null });

    const handleCloseTime = () => setShowTime(false);
    const handleShowTime = (drawId, teeTime, hole) => {
        setCurrentlyEditing({ drawId, teeTime, hole });
        setShowTime(true);
    };

    const saveTimesheet = async (drawId, timesheet) => {
        const drawRef = doc(db, "draws", drawId);
        await updateDoc(drawRef, {
            timesheet,
            updated: serverTimestamp(),
            updatedBy: currentUser.email
        });
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

    useEffect(() => {
        const getEmptyTiming = (startTime, startingTee, timePar) => {
            let emptyTiming = {
                start: {
                    expected: startTime,
                    actual: null,
                }
            };
            const teetime = new Date(`2025-01-01T${startTime}:00`);
            let currentHole = startingTee;
            let timeSpentInSeconds = 0;
            for (let i = 0; i < 18; i++) {
                const { playingTime, walkingTime, toRecording } = timePar[currentHole];
                timeSpentInSeconds += playingTime * 60;
                if (i > 0) {
                    timeSpentInSeconds += walkingTime * 60;
                }
                const endOfHoleTime = new Date(teetime.getTime() + timeSpentInSeconds * 1000);
                emptyTiming[currentHole] = {
                    expected: endOfHoleTime.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }),
                    actual: null
                };
                if (i === 17) {
                    timeSpentInSeconds += toRecording * 60;
                    const recordingTime = new Date(teetime.getTime() + timeSpentInSeconds * 1000);
                    emptyTiming['recording'] = {
                        expected: recordingTime.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }),
                        actual: null
                    };

                }
                currentHole = (currentHole % 18) + 1;
            }
            return emptyTiming;
        };

        const getEmptyTimesheet = (draw, firstGroupNumber = 1) => {
            let emptyTimesheet = {};
            let currentGroupNumber = firstGroupNumber;
            const { startingTime, numberOfGroups, startingInterval, startingTee, courseId } = draw;
            if (startingTime && numberOfGroups && startingInterval && startingTee && courseId && courses[courseId]) {
                const firstTeeTime = new Date(`2025-01-01T${startingTime}:00`);
                const { timePar } = courses[courseId];
                for (let i = 0; i < numberOfGroups; i++) {
                    const teeTime = new Date(firstTeeTime.getTime() + (i * startingInterval * 60000));
                    const currentTime = teeTime.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })
                    emptyTimesheet[currentTime] = {
                        groupNumer: currentGroupNumber + i,
                        timing: getEmptyTiming(currentTime, startingTee, timePar)
                    };
                }
            }
            return emptyTimesheet;
        }
        let timesheets = {};
        let firstGroupNumber = 1;
        Object.keys(draws).forEach((drawId) => {
            if (draws[drawId].timesheet && Object.keys(draws[drawId].timesheet).length) {
                timesheets[drawId] = draws[drawId].timesheet;
            } else {
                timesheets[drawId] = getEmptyTimesheet(draws[drawId], firstGroupNumber);
            }
            firstGroupNumber += draws[drawId].numberOfGroups;
        });
        setTimesheets(timesheets);
    }, [courses, draws]);



    return (
        <Container fluid>
            {
                draws && Object.keys(draws).length && timesheets && Object.keys(timesheets).length
                    ? (<>
                        <h5>Timesheets</h5>
                        <Accordion defaultActiveKey="0" className="mt-3">
                            {
                                Object.keys(draws).map((drawId) => (
                                    <Accordion.Item eventKey={`draw-${drawId}`} key={`draw-${drawId}`}>
                                        <Accordion.Header>
                                            <span className="fw-bold">
                                                Draw starting at {draws[drawId].startingTime} on Tee # {draws[drawId].startingTee}
                                            </span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="fst-italic mb-3">
                                                {courses[draws[drawId].courseId].golfClubName} - {courses[draws[drawId].courseId].courseName}
                                            </div>
                                            <table className="table table-striped-columns table-hover table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Group</th>
                                                        <th scope="col" className="text-center">Tee time</th>
                                                        {
                                                            [...Array(18).keys()].map((i => <th scope="col" key={`th-hole-${i + 1}`} className="text-center">{i + 1}</th>))
                                                        }
                                                        <th scope="col" className="text-center">Recording</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        Object.keys(timesheets[drawId]).sort().map((time, index) => (
                                                            <tr key={`timesheet-${drawId}-${time}`}>
                                                                <th scope="row" className={`${index % 2 === 1 ? 'bg-info' : ''}`} style={index % 2 === 1 ? { '--bs-bg-opacity': .15 } : {}}>
                                                                    #{timesheets[drawId][time].groupNumer}
                                                                </th>
                                                                <td
                                                                    key={`timesheet-${drawId}-${time}-start`}
                                                                    className={`${index % 2 === 1 ? 'bg-info' : ''}`}
                                                                    style={index % 2 === 1 ? { '--bs-bg-opacity': .15 } : {}}
                                                                    onClick={e => handleShowTime(drawId, time, 'start')}>
                                                                    {timesheets[drawId][time].timing.start.expected}
                                                                </td>
                                                                {
                                                                    [...Array(18).keys()].map((i => (
                                                                        <td
                                                                            key={`timesheet-${drawId}-${time}-${i + 1}`}
                                                                            className={`${index % 2 === 1 ? 'bg-info' : ''}`}
                                                                            style={index % 2 === 1 ? { '--bs-bg-opacity': .15 } : {}}
                                                                            onClick={e => handleShowTime(drawId, time, i + 1)}
                                                                        >
                                                                            <TimingForHole timing={timesheets[drawId][time].timing[i + 1]} />
                                                                        </td>
                                                                    )))
                                                                }
                                                                <td
                                                                    key={`timesheet-${drawId}-${time}-recording`}
                                                                    className={`${index % 2 === 1 ? 'bg-info' : ''}`}
                                                                    style={index % 2 === 1 ? { '--bs-bg-opacity': .15 } : {}}
                                                                    onClick={e => handleShowTime(drawId, time, 'recording')}>
                                                                    {timesheets[drawId][time].timing.recording.expected}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))
                            }
                        </Accordion>
                        <Modal
                            show={showTime}
                            onHide={handleCloseTime}
                            backdrop="static">
                            <UpdateTimeModal
                                handleCloseTime={handleCloseTime}
                                timesheets={timesheets}
                                saveTimesheet={saveTimesheet}
                                drawId={currentlyEditing.drawId}
                                teeTime={currentlyEditing.teeTime}
                                hole={currentlyEditing.hole} />
                        </Modal>

                    </>)
                    : <Alert variant="warning" className="my-4">No timesheets for this round. Go to "Draw" to add one.</Alert>
            }
        </Container>
    );
}