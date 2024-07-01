import Container from 'react-bootstrap/Container';
export const Welcome = () => {

    return (
        <Container>
            <p>Welcome!</p>
            <p>Please select an event below:</p>
            <ul>
                <li>
                    <a href="/events/testEvent">Test Event</a>
                </li>
            </ul>
        </Container>
    );
}