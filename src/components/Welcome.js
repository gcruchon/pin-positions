import Container from 'react-bootstrap/Container';
export const Welcome = () => {

    return (
        <Container fluid>
            <h2>Welcome!</h2>
            <p>Please select what you want to do:</p>
            <ul>
                <li>
                    <a href="/events">See event list</a>
                </li>
            </ul>
        </Container>
    );
}