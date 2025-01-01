import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../firebase';
import { useAuth } from '../hooks';

export const CourseDetails = () => {
    const { courseId } = useParams();
    const { currentUser } = useAuth();
    const { courseData } = useOutletContext();

    const [showToast, setShowToast] = useState(false);

    const updateCourse = async (updatedFragment) => {
        setShowToast(true);
        const courseRef = doc(db, "courses", courseId);
        updatedFragment["updated"] = serverTimestamp();
        updatedFragment["updatedBy"] = currentUser.email;
        await updateDoc(courseRef, updatedFragment);
        setShowToast(false);
    }

    const saveCourseField = async (value, field) => {
        let updatedFragment = {};
        updatedFragment[field] = value;
        await updateCourse(updatedFragment);
    }

    return (
        <Container fluid>
            <div className="d-flex flex-row">
                <div className="p-2">
                    <h5>Course details</h5>
                </div>
                <div className={showToast ? "p-2" : "d-none"}>
                    [Saving...]
                </div>
            </div>
            <Form>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Golf club name
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="text"
                            placeholder="St Andrews"
                            defaultValue={courseData.golfClubName || ""}
                            onBlur={(e) => saveCourseField(e.target.value, "golfClubName")} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Course name
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="text"
                            placeholder="The Old Course"
                            defaultValue={courseData.courseName || ""}
                            onBlur={(e) => saveCourseField(e.target.value, "courseName")} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">
                        Country
                    </Form.Label>
                    <Col sm="10">
                        <Form.Select
                            aria-label="Course country"
                            defaultValue="France"
                            onChange={(e) => saveCourseField(e.target.value, "country")}>
                            <option value="France">France</option>
                        </Form.Select>
                    </Col>
                </Form.Group>
            </Form>
        </Container>
    );
}