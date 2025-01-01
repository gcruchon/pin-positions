import { useState, useEffect } from 'react';
import { Link, Outlet, useParams, useLocation, useNavigate } from 'react-router';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Pagination from 'react-bootstrap/Pagination';
import { doc, onSnapshot } from 'firebase/firestore';

import { db } from '../firebase';
import { Pencil } from 'react-bootstrap-icons';

export const Course = () => {
    const { courseId } = useParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const [courseData, setCourseData] = useState({});
    const [coursePageStatus, setCoursePageStatus] = useState("syncing");

    const activePage = pathname.split("/").pop();

    useEffect(() => {
        setCoursePageStatus("loading");
        const courseRef = doc(db, "courses", courseId);
        const unsubscribe = onSnapshot(courseRef, (querySnapshot) => {
            if(querySnapshot.exists) {
                setCourseData(querySnapshot.data());
                setCoursePageStatus("course-exists");
            } else {
                setCoursePageStatus("not-found");
            }
        });
        return () => unsubscribe();
    }, [courseId]);

    return (
        <>
            <Container className={coursePageStatus === "course-exists" ? "" : "d-none"} fluid >
                <h2>
                    {courseData.golfClubName}
                    {' - '}
                    {courseData.courseName}
                    {' '}
                    <Link to={`/courses/${courseId}/details`}>
                        <Button variant="outline-primary" size="sm" className="ms-2">
                            <Pencil />
                            <span className="visually-hidden">Edit course</span>
                        </Button>
                    </Link>
                </h2>
                <Pagination className="justify-content-center" style={{ width: '100%' }}>
                    <Pagination.Item active={activePage === 'details'} onClick={(e) => navigate(`/courses/${courseId}/details`)}>Course details</Pagination.Item>
                    <Pagination.Item active={activePage === 'timepar'} onClick={(e) => navigate(`/courses/${courseId}/timepar`)}>Time Par</Pagination.Item>
                </Pagination>

                <Outlet context={{ courseData }} />

            </Container>
            <Alert show={coursePageStatus === "loading"} variant="info">Loading course...</Alert>
            <Alert show={coursePageStatus === "not-found"} variant="danger">Course not found!</Alert>
        </>
    );
}