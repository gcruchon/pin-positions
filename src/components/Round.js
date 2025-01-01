import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useOutletContext, useParams, useLocation } from 'react-router';
import Alert from 'react-bootstrap/Alert';
import Pagination from 'react-bootstrap/Pagination';

import { getLocalDateFromDb, dateOptions } from '../utils';

import './dots.css'

export const Round = () => {
    const { eventId, round } = useParams();
    const { eventData, holes, rulings, referees } = useOutletContext();
    const { pathname } = useLocation();
    const [roundData, setRoundData] = useState({ roundDate: null, dotColor: null });
    const navigate = useNavigate();

    const activePage = pathname.split("/").pop();

    useEffect(() => {
        const roundIndex = isNaN(round)
            ? 0
            : parseInt(round, 10);
        if (roundIndex > 0 && eventData.rounds && eventData.rounds.length >= roundIndex) {
            setRoundData(eventData.rounds[roundIndex - 1]);
        }
    }, [eventData.rounds, round]);


    return (
        <>
            {
                roundData.date
                    ? <div>
                        <p className="my-3">
                            {'Date: '}
                            <span className="fw-bold">
                                {getLocalDateFromDb(roundData.date).toLocaleDateString("en-GB", dateOptions)}
                            </span>
                            {' - Dots: '}
                            <span className={`fw-bold py-1 px-2 rounded-pill dots-${roundData.dotColor}`}>{roundData.dotColor}</span>
                        </p>
                        <Pagination className="justify-content-center" style={{width: '100%'}}>
                            <Pagination.Item active={activePage === 'pins'} onClick={(e) => navigate(`/events/${eventId}/round/${round}/pins`)}>Enter pins</Pagination.Item>
                            <Pagination.Item active={activePage === 'stats'} onClick={(e) => navigate(`/events/${eventId}/round/${round}/stats`)}>Pin stats</Pagination.Item>
                            <Pagination.Item active={activePage === 'rulings'} onClick={(e) => navigate(`/events/${eventId}/round/${round}/rulings`)}>Rulings</Pagination.Item>
                            <Pagination.Item active={activePage === 'draw'} onClick={(e) => navigate(`/events/${eventId}/round/${round}/draw`)}>Draw</Pagination.Item>
                            <Pagination.Item active={activePage === 'timesheet'} onClick={(e) => navigate(`/events/${eventId}/round/${round}/timesheet`)}>Timesheet</Pagination.Item>
                        </Pagination>

                        <Outlet context={{ eventId, eventData, holes, rulings, referees }} />
                    </div>
                    : <Alert variant="warning" className="mt-4">No round configured</Alert>
            }

        </>
    );
}