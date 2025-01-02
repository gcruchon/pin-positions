import { Outlet } from 'react-router';
import { useOutletContext, useNavigate, useParams, useLocation } from 'react-router';

import Pagination from 'react-bootstrap/Pagination';

import './submenu.css'

export const RoundTimesheet = () => {
    const { eventId, round } = useParams();
    const { eventData, holes } = useOutletContext();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const activePage = pathname.split("/").pop();

    return (
        <>
            <Pagination className="submenu justify-content-center" style={{ width: '100%' }}>
                <Pagination.Item active={activePage === 'edit'} onClick={(e) => navigate(`/events/${eventId}/round/${round}/timesheet/edit`)}>Edit timesheet</Pagination.Item>
                <Pagination.Item active={activePage === 'draw'} onClick={(e) => navigate(`/events/${eventId}/round/${round}/timesheet/draw`)}>Edit draws</Pagination.Item>
            </Pagination>

            <Outlet context={{ eventData, holes }} />
        </>
    );
}