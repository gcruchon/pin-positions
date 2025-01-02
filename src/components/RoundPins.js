import { Outlet } from 'react-router';
import { useOutletContext, useNavigate, useParams, useLocation } from 'react-router';

import Pagination from 'react-bootstrap/Pagination';

import './submenu.css'

export const RoundPins = () => {
    const { eventId, round } = useParams();
    const { eventData, holes } = useOutletContext();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const activePage = pathname.split("/").pop();

    return (
        <>
            <Pagination className="submenu justify-content-center" style={{ width: '100%' }}>
                <Pagination.Item active={activePage === 'edit'} onClick={(e) => navigate(`/events/${eventId}/round/${round}/pins/edit`)}>Edit pins</Pagination.Item>
                <Pagination.Item active={activePage === 'stats'} onClick={(e) => navigate(`/events/${eventId}/round/${round}/pins/stats`)}>See stats</Pagination.Item>
            </Pagination>

            <Outlet context={{ eventData, holes }} />
        </>
    );
}