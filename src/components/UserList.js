import { useEffect, useState } from 'react';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Table from 'react-bootstrap/Table';
import { collection, onSnapshot, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks';
import { validateEmail } from '../utils';

export const UserList = () => {
    const { currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [newLastname, setNewLastname] = useState("");
    const [newFirstname, setNewFirstname] = useState("");
    const [newEmail, setNewEmail] = useState("");

    const createUser = async () => {
        if (newLastname.trim() === "") {
            alert("You must enter a last name for this new user.");
            return;
        }
        if (newFirstname.trim() === "") {
            alert("You must enter a first name for this new user.");
            return;
        }
        if (newEmail.trim() === "" || !validateEmail(newEmail.trim())) {
            alert("You must enter a valid email for this new user.");
            return;
        }
        await setDoc(doc(db, `users/${newEmail.trim()}`), {
            lastname: newLastname.trim(),
            firstname: newFirstname.trim(),
            email: newEmail.trim(),
            role: 'user',
            created: serverTimestamp(),
            createdBy: currentUser.email,
        });

    }

    useEffect(() => {
        const usersRef = collection(db, "users");
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            let usersObj = {};
            snapshot.forEach((doc) => {
                usersObj[doc.id] = doc.data();
            });
            setUsers(usersObj);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Container fluid>
            <h2>Users</h2>
            <Table striped={true} bordered={true} hover={true} size="sm">
                <thead>
                    <tr>
                        <th>
                            Firstname
                        </th>
                        <th>
                            Lastname
                        </th>
                        <th>
                            Email
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        Object.keys(users).length
                            ? Object.keys(users).map((email) => (
                                <tr key={`users-${email}`}>
                                    <td>{users[email].firstname}</td>
                                    <td>{users[email].lastname}</td>
                                    <td>{email}</td>
                                </tr>
                            ))
                            : <tr><td colSpan={3}>No users</td></tr>
                    }
                </tbody>
            </Table>
            <hr />
            <h2>Create new user</h2>
            <InputGroup className="mb-3">
                <InputGroup.Text className="">First name</InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="First name"
                    value={newFirstname}
                    onChange={(e) => setNewFirstname(e.target.value)}
                />
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text className="">Last name</InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder="Last name"
                    value={newLastname}
                    onChange={(e) => setNewLastname(e.target.value)}
                />
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text className="">Email</InputGroup.Text>
                <Form.Control
                    type="email"
                    placeholder="official@randa.org"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                />
            </InputGroup>
            <Button variant="outline-primary" onClick={() => createUser()}>Create User</Button>
        </Container>
    );
}