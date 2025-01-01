import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks';

export const CourseList = () => {
    const { currentUser } = useAuth();

    const [courses, setCourses] = useState([]);
    const [newGolfClubName, setNewGolfClubName] = useState("");
    const [newCourseName, setNewCourseName] = useState("");

    const createCourse = async () => {
        if (newGolfClubName === "") {
            alert("You must enter a golf club name for this new course.");
            return;
        }
        if (newCourseName.trim() === "") {
            alert("You must enter a name for this new course.");
            return;
        }
        await addDoc(collection(db, "courses"), {
            courseName: newCourseName.trim(),
            golfClubName: newGolfClubName.trim(),
            created: serverTimestamp(),
            createdBy: currentUser.email,
        });

    }

    useEffect(() => {
        if (currentUser && currentUser.email) {
            const coursesRef = collection(db, "courses");
            const unsubscribe = onSnapshot(coursesRef, (querySnapshot) => {
                let courses = {};
                querySnapshot.forEach((doc) => {
                    courses[doc.id] = doc.data();
                });
                setCourses(courses);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    return (
        <Container fluid>
            <h2>Course list</h2>
            <p>Please select a course below:</p>
            <div className="list-group">
                {
                    Object.keys(courses).length
                        ? Object.keys(courses).map((courseId) => (
                            <Link to={`/courses/${courseId}`} className="list-group-item list-group-item-action" key={`courses-${courseId}`}>
                                {courses[courseId].golfClubName} - {courses[courseId].courseName}
                            </Link>
                        ))
                        : <div>No courses</div>
                }
            </div>
            <hr />
            <h2>Create new course</h2>
            <InputGroup className="mb-3">
                <InputGroup.Text className="">New golf club name</InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="New golf club name"
                    value={newGolfClubName}
                    onChange={(e) => setNewGolfClubName(e.target.value)}
                />
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text className="">New course name</InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="New course name"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                />
            </InputGroup>
            <Button variant="outline-primary" onClick={() => createCourse()}>Create course</Button>
        </Container>
    );
}