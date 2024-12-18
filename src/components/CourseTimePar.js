import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../firebase';
import { useAuth } from '../hooks';

export const CourseTimePar = () => {
    const { courseId } = useParams();
    const { currentUser } = useAuth();
    const { courseData } = useOutletContext();

    const DEFAULT_WALKING_TIME = {
        "3": 11,
        "4": 14,
        "5": 17,
    }

    const getEmptyTimePar = () => {
        const emptyTimePar = {};
        [...Array(18).keys()].forEach(i => {
            emptyTimePar[i + 1] = { par: 4, walkingTime: 0, playingTime: DEFAULT_WALKING_TIME["4"] };
            if ((i + 1) % 9 === 0) {
                emptyTimePar[i + 1]["toRecording"] = 0;
            }
        });
        return emptyTimePar;
    }

    const [timePar, setTimePar] = useState(getEmptyTimePar());
    const [showToast, setShowToast] = useState(false);

    const getTimeAsNumber = (value) => (value === '' || isNaN(value)) ? 0 : parseFloat(value);

    const convertTimesToNumbers = (timePar) => {
        Object.keys(timePar).forEach(hole => {
            timePar[hole]["walkingTime"] = getTimeAsNumber(timePar[hole]["walkingTime"]);
            timePar[hole]["playingTime"] = getTimeAsNumber(timePar[hole]["playingTime"]);
        });
        return timePar;
    }

    const getTotalTime = (timePar, firstHole = 1) => {
        let totalTime = 0;
        Object.keys(timePar).forEach(hole => {
            if (hole.toString() !== firstHole.toString()) {
                totalTime += getTimeAsNumber(timePar[hole]["walkingTime"]);
            }
            totalTime += getTimeAsNumber(timePar[hole]["playingTime"]);
        });
        totalTime = Math.round(totalTime);
        const hours = Math.trunc(totalTime / 60);
        const min = totalTime % 60
        return `${hours}h${min}`;
    }

    const updateTimePar = async () => {
        setShowToast(true);
        const courseRef = doc(db, "courses", courseId);
        const updatedFragment = {
            timePar: convertTimesToNumbers(timePar),
            updated: serverTimestamp(),
            updatedBy: currentUser.email,
        };
        await updateDoc(courseRef, updatedFragment);
        setShowToast(false);
    }

    const updatePar = async (hole, value) => {
        const updatedTimePar = { ...timePar };
        updatedTimePar[hole]["par"] = parseInt(value, 10);
        updatedTimePar[hole]["playingTime"] = DEFAULT_WALKING_TIME[value];
        setTimePar(updatedTimePar);
        await updateTimePar();
    }
    const updateTime = async (hole, value, timeType) => {
        const updatedTimePar = { ...timePar };
        updatedTimePar[hole][timeType] = value;
        setTimePar(updatedTimePar);
    }
    useEffect(() => {
        if (courseData.timePar) {
            setTimePar(courseData.timePar);
        }
    }, [courseData.timePar]);

    return (
        <Container fluid>
            <div className="d-flex flex-row">
                <h5>Course time par</h5>
                <div className={showToast ? "ps-2" : "d-none"}>
                    [Saving...]
                </div>
            </div>
            <div className="my-3">
                <span className="fw-bold">
                    Total time allowed : {getTotalTime(timePar)} from 1st tee and {getTotalTime(timePar, 10)} from 10th tee.
                </span>
            </div>
            {
                [...Array(18).keys()].map((i => {
                    const hole = i + 1;

                    return (
                        <div key={`timepar-${i}`}>
                            <InputGroup>
                                <InputGroup.Text className="fw-bold">Hole # {hole}</InputGroup.Text>
                                <InputGroup.Text>Par</InputGroup.Text>
                                <Form.Select
                                    aria-label={`Hole ${hole} par`}
                                    value={timePar[hole].par}
                                    onChange={(e) => updatePar(hole, e.target.value)}>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </Form.Select>
                            </InputGroup>
                            <InputGroup>
                                <InputGroup.Text>Walking time to this hole</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    size="3"
                                    value={timePar[hole].walkingTime}
                                    onChange={(e) => updateTime(hole, e.target.value, "walkingTime")}
                                    onBlur={(e) => updateTimePar()} />
                                <InputGroup.Text>min.</InputGroup.Text>
                            </InputGroup>
                            {
                                (i + 1) % 9 === 0
                                    ? (
                                        <InputGroup>
                                            <InputGroup.Text>Time to reach recording</InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                size="3"
                                                value={timePar[hole].toRecording}
                                                onChange={(e) => updateTime(hole, e.target.value, "toRecording")}
                                                onBlur={(e) => updateTimePar()} />
                                            <InputGroup.Text>min.</InputGroup.Text>
                                        </InputGroup>
                                    )
                                    : ''
                            }
                            <InputGroup className="mb-4">
                                <InputGroup.Text>Playing time</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    size="3"
                                    value={timePar[hole].playingTime}
                                    onChange={(e) => updateTime(hole, e.target.value, "playingTime")}
                                    onBlur={(e) => updateTimePar()} />
                                <InputGroup.Text>min.</InputGroup.Text>
                            </InputGroup>
                        </div>

                    );
                }))
            }
            <div className="my-3">
                <span className="fw-bold">
                    Total time allowed : {getTotalTime(timePar)} from 1st tee and {getTotalTime(timePar, 10)} from 10th tee.
                </span>
            </div>
        </Container>
    );
}