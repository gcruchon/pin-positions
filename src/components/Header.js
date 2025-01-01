import { NavLink } from 'react-router';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

import './Header.css';
import { useAuth } from '../hooks';

export const Header = () => {
    const { currentUser, signOutFromApp, signIn } = useAuth();

    return (
        <Container fluid className="Header d-flex pt-3 pb-1 mb-3">
            <h1>
                Golf events
            </h1>
            <nav className="pt-2 ps-3">
                <NavLink to="/">Home</NavLink>
                {' - '}
                <NavLink to="/events">Events</NavLink>
                {' - '}
                <NavLink to="/courses">Courses</NavLink>
                {' - '}
                <NavLink to="/users">Referees</NavLink>
            </nav>
            {
                currentUser
                    ? (
                        <div className="ms-auto text-end">
                            <span className="pe-3">{currentUser.displayName}</span>
                            <Button onClick={signOutFromApp} size="sm" variant="outline-primary">Sign out</Button>
                        </div>
                    )
                    : (
                        <div className="ms-auto text-end">
                            <Button onClick={async () => signIn('/')} size="sm" variant="outline-primary">Sign in</Button>
                        </div>
                    )
            }
        </Container>
    );
}