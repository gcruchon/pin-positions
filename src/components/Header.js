import { useContext } from 'react';
import { signOut } from "firebase/auth";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

import { AppContext } from '../App';

import { auth } from '../firebase';
import './Header.css';

export const Header = () => {
    const currentUser = useContext(AppContext);

    const signOutFromApp = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
        });
    }

    return (
        <Container fluid className="Header d-flex pt-3 pb-1 mb-3">
            <h1>
                Pin positions
            </h1>
            
            {
                currentUser
                    ? (
                        <div className="ms-auto text-end">
                            <span className="pe-3">{currentUser.displayName}</span>
                            <Button onClick={signOutFromApp} size="sm" variant="outline-primary">Sign out</Button>
                        </div>)
                    : ""
            }
        </Container>
    );
}