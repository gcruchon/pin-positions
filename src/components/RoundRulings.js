import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import { Trash } from 'react-bootstrap-icons';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

import { rulingDateTimeOptions } from '../utils';
import { db } from '../firebase';
import { useAuth } from '../hooks';

import './RoundRulings.css'

const RulingBody = ({ ruling }) => {
    return (
        <>
            <div>
                {
                    isNaN(ruling.hole)
                        ? <span className="fw-bold">{ruling.hole}</span>
                        : (<>Hole <span className="fw-bold">#{ruling.hole}</span></>)
                }
            </div>
            <div>
                Group <span className="fw-bold">#{ruling.group}</span>
                {' '}-{' '}
                Players involved: <span className="fw-bold">{ruling.playerName}</span>
            </div>
            <div>
                Applied rules: <span className="fw-bold">{ruling.rulesApplied}</span>
            </div>
            {
                ruling && ruling.comment
                    ? (
                        <div>
                            Additionnal comments: <span className="fw-bold">{ruling.comment}</span>
                        </div>
                    )
                    : ''
            }
        </>
    )
}

const RulingForm = ({ ruling, setRuling, isSaving }) => {

    const setRulingField = (ruling, field, value) => {
        let newRuling = { ...ruling };
        newRuling[field] = value;
        setRuling(newRuling);
    }

    return (
        <>
            <Row>
                <Col sm={2}>
                    <InputGroup>
                        <InputGroup.Text className="">Hole</InputGroup.Text>
                        <Form.Select
                            type="text"
                            placeholder="New event name"
                            value={ruling.hole}
                            onChange={(e) => setRulingField(ruling, "hole", e.target.value)}>
                            <option key={`hole-0`} value="Before round">Before round</option>
                            {
                                Array.from({ length: 18 }, (_, i) => i + 1).map(hole => (
                                    <option key={`hole-${hole}`} value={hole}>{hole}</option>
                                ))
                            }
                            <option key={`hole-19`} value="Recording">Recording</option>
                        </Form.Select>
                    </InputGroup>
                </Col>
                <Col sm={2}>
                    <InputGroup className="mb-1">
                        <InputGroup.Text className="">Group</InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Group #"
                            value={ruling.group}
                            onChange={(e) => setRulingField(ruling, "group", e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col sm={8}>
                    <InputGroup className="mb-1">
                        <InputGroup.Text className="">Players involved</InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="John Doe and Tony Stark"
                            value={ruling.playerName}
                            onChange={(e) => setRulingField(ruling, "playerName", e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Col>
                    <InputGroup className="mb-1">
                        <InputGroup.Text className="">Applied rules</InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="R16.1 and MLR F-5.2"
                            value={ruling.rulesApplied}
                            onChange={(e) => setRulingField(ruling, "rulesApplied", e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Col>
                    <InputGroup className="mb-1">
                        <InputGroup.Text className="">Additional comments</InputGroup.Text>
                        <Form.Control
                            type="text"
                            as="textarea"
                            rows={3}
                            placeholder=""
                            value={ruling.comment}
                            onChange={(e) => setRulingField(ruling, "comment", e.target.value)}
                        />
                    </InputGroup>
                </Col>
            </Row>
            <div className={isSaving ? "p-2 alert alert-primary" : "d-none"}>
                [Saving...]
            </div>

        </>

    );
}

export const RoundRulings = () => {
    const { currentUser } = useAuth();
    const { eventId, round } = useParams();
    const { eventData, rulings, referees } = useOutletContext();
    const [roundData, setRoundData] = useState({ roundDate: null, dotColor: null });
    const [rulingIds, setRulingIds] = useState([]);
    const [newRuling, setNewRuling] = useState({ hole: "1", group: "", playerName: "", rulesApplied: "", comment: "" });
    const [updatedRuling, setUpdatedRuling] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const isRulingFromCurrentUser = ruling => ruling.referee === currentUser.email;
    const rulingIsUpdating = rulingId => updatedRuling && updatedRuling.id === rulingId;

    const startUpdateRuling = (rulingId, ruling) => {
        if (updatedRuling !== null) {
            if (!window.confirm("Another ruling is currently being updated, do you want to continue without saving?")) {
                return;
            }
        }
        setUpdatedRuling({ id: rulingId, ...ruling });
    }
    const cancelUpdateRuling = () => setUpdatedRuling(null);
    const updateRuling = async () => {
        const rulingId = updatedRuling.id;
        setIsSaving(true);
        try {
            await updateDoc(doc(db, "rulings", rulingId), {
                ...updatedRuling,
                updated: serverTimestamp(),
                updatedBy: currentUser.email,
            });
        }
        catch (err) {
            console.error(err)
        };
        setIsSaving(false);
        setUpdatedRuling(null)
    }
    const deleteRuling = async (rulingId) => {
        if (window.confirm("Are you sure you want to delete this ruling? This cannot be undone.")) {
            setIsSaving(true);
            try {
                await updateDoc(doc(db, "rulings", rulingId), {
                    deleted: true,
                    updated: serverTimestamp(),
                    updatedBy: currentUser.email,
                });
            }
            catch (err) {
                console.error(err)
            };
            setIsSaving(false);
        }
    }
    const createRuling = async () => {
        if (newRuling.group.trim() === "") {
            alert("You must enter a group number for this ruling.");
            return;
        }
        if (newRuling.playerName.trim() === "") {
            alert("You must enter a player name for this ruling.");
            return;
        }
        if (newRuling.rulesApplied.trim() === "") {
            alert("You must enter the rule / local rule you applied for this ruling.");
            return;
        }
        setIsSaving(true);
        try {
            await addDoc(collection(db, "rulings"), {
                eventId: eventId,
                round: parseInt(round, 10),
                hole: newRuling.hole,
                group: newRuling.group.trim(),
                playerName: newRuling.playerName.trim(),
                rulesApplied: newRuling.rulesApplied.trim(),
                comment: newRuling.comment.trim(),
                referee: currentUser.email,
                deleted: false,
                ruledAt: serverTimestamp(),
                created: serverTimestamp(),
                createdBy: currentUser.email,
            });
            setNewRuling({ hole: "1", group: "", playerName: "", rulesApplied: "", comment: "" });
        }
        catch (err) {
            console.error(err)
        };
        setIsSaving(false);
    }

    useEffect(() => {
        const roundIndex = isNaN(round)
            ? 0
            : parseInt(round, 10);
        if (roundIndex > 0 && eventData.rounds && eventData.rounds.length >= roundIndex) {
            setRoundData(eventData.rounds[roundIndex - 1]);
        }
        setRulingIds(Object.keys(rulings).filter(rulingId =>
            (roundIndex === 0 || rulings[rulingId].round === roundIndex))
        );
    }, [eventData.rounds, round, rulings]);


    return (
        <>
            {
                roundData.date
                    ? <>
                        {
                            rulingIds.length
                                ?
                                rulingIds.map(rulingId => {
                                    return (
                                        rulings && rulings[rulingId]
                                            ? <div key={`ruling-${rulingId}`} className={`card mb-3 ${isRulingFromCurrentUser(rulings[rulingId]) ? "Ruling-current-referee" : "Ruling-other-referee"}`}>
                                                <div className="card-body">
                                                    {
                                                        rulingIsUpdating(rulingId)
                                                            ? (
                                                                <>
                                                                    <RulingForm ruling={updatedRuling} setRuling={setUpdatedRuling} isSaving={isSaving} />
                                                                    <Button className="me-3 mt-3" variant="outline-primary" onClick={() => cancelUpdateRuling()} disabled={isSaving}>
                                                                        Cancel
                                                                    </Button>
                                                                    <Button className="mt-3" variant="primary" onClick={() => updateRuling()} disabled={isSaving}>
                                                                        Save
                                                                    </Button>
                                                                </>
                                                            )
                                                            : (
                                                                <>
                                                                    <RulingBody ruling={rulings[rulingId]} />
                                                                    {
                                                                        isRulingFromCurrentUser(rulings[rulingId])
                                                                            ? (
                                                                                <Button className="mt-2" size="sm" variant="outline-primary" onClick={() => startUpdateRuling(rulingId, rulings[rulingId])} disabled={isSaving}>
                                                                                    Update ruling
                                                                                </Button>
                                                                            )
                                                                            : ''
                                                                    }
                                                                </>)

                                                    }
                                                </div>
                                                <div className="fst-italic card-footer text-dark d-flex align-items-center">
                                                    <div className="flex-grow-1">
                                                        {'Ruled by '}
                                                        {referees[rulings[rulingId].referee].firstname}
                                                        {' '}
                                                        {referees[rulings[rulingId].referee].lastname}
                                                        {' on '}
                                                        {
                                                            rulings[rulingId].ruledAt
                                                                ? rulings[rulingId].ruledAt.toDate().toLocaleString("en-GB", rulingDateTimeOptions)
                                                                : ""
                                                        }
                                                    </div>
                                                    <div>
                                                        {
                                                            isRulingFromCurrentUser(rulings[rulingId])
                                                                ? (
                                                                    <Button className="float-end ms-3" size="sm" variant="danger" onClick={() => deleteRuling(rulingId)} disabled={isSaving}>
                                                                        <Trash />
                                                                    </Button>
                                                                )
                                                                : ""
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            : <></>

                                    )
                                })
                                : <Alert variant="info" className="mt-4">No ruling yet</Alert>
                        }
                        <div className="card mb-3">
                            <div className="card-body">
                                <h5 className="card-title">Add a ruling</h5>
                                <RulingForm ruling={newRuling} setRuling={setNewRuling} isSaving={isSaving} />
                                <Button variant="outline-primary" onClick={() => createRuling()} disabled={isSaving}>Save Ruling</Button>
                            </div>
                        </div>
                    </>
                    : ''
            }

        </>
    );
}