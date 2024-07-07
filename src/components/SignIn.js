import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { signInWithPopup } from "firebase/auth";

import { provider, auth } from '../firebase';

export const SignIn = () => {
    const signIn = () => {
        signInWithPopup(auth, provider)
            .then(() => {
            }).catch((error) => {
                // Handle Errors here.
                console.log(error);
            });
    }
    return (
        <Container>
            <p>Please sign-in with your Google account:</p>
            <Button onClick={signIn}>Sign in with Google</Button>
        </Container>
    );
}