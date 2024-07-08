import { useLoaderData } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../hooks';



export const loader = ({ request }) => {
    const url = new URL(request.url);
    return {
        message: url.searchParams.get("message"),
        nextUrl: url.searchParams.get("nextUrl")
    }
}
export const Login = () => {
    const { message, nextUrl } = useLoaderData();
    const { signIn } = useAuth();
    return (
        <Container>
            {
                message
                    ? <Alert variant="warning my-4">{message}</Alert>
                    : ""
            }
            <p>Please sign-in with your Google account:</p>
            <Button onClick={async () => signIn(nextUrl)}>Sign in with Google</Button>
        </Container>
    );
}