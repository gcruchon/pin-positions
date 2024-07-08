import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../hooks';

export const SignIn = () => {
    const { signIn } = useAuth();
    return (
        <Container>
            <p>Please sign-in with your Google account:</p>
            <Button onClick={signIn}>Sign in with Google</Button>
        </Container>
    );
}