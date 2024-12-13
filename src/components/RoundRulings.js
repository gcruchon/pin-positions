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

export const RoundRulings = () => {
    const { currentUser } = useAuth();
    const { eventId, round } = useParams();
    const { eventData, rulings, referees } = useOutletContext();
    const [roundData, setRoundData] = useState({ roundDate: null, dotColor: null });
    const [rulingIds, setRulingIds] = useState([]);
    const [newRulingHole, setNewRulingHole] = useState("1");
    const [newRulingGroup, setNewRulingGroup] = useState("");
    const [newRulingPlayerName, setNewRulingPlayerName] = useState("");
    const [newRulingRulesApplied, setNewRulingRulesApplied] = useState("");
    const [newRulingComment, setNewRulingComment] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const isRulingFromCurrentUser = ruling => ruling.referee === currentUser.email;

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
                console.log(err)
            };
            setIsSaving(false);

        }
    }
    const createRuling = async () => {
        if (newRulingGroup.trim() === "") {
            alert("You must enter a group number for this ruling.");
            return;
        }
        if (newRulingPlayerName.trim() === "") {
            alert("You must enter a player name for this ruling.");
            return;
        }
        if (newRulingRulesApplied.trim() === "") {
            alert("You must enter the rule / local rule you applied for this ruling.");
            return;
        }
        setIsSaving(true);
        try {
            await addDoc(collection(db, "rulings"), {
                eventId: eventId,
                round: parseInt(round, 10),
                hole: newRulingHole,
                group: newRulingGroup.trim(),
                playerName: newRulingPlayerName.trim(),
                rulesApplied: newRulingRulesApplied.trim(),
                comment: newRulingComment.trim(),
                referee: currentUser.email,
                deleted: false,
                ruledAt: serverTimestamp(),
                created: serverTimestamp(),
                createdBy: currentUser.email,
            });
            setNewRulingHole("1");
            setNewRulingGroup("");
            setNewRulingPlayerName("");
            setNewRulingRulesApplied("");
            setNewRulingComment("");
        }
        catch (err) {
            console.log(err)
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
                                                    <div>
                                                        {
                                                            isNaN(rulings[rulingId].hole)
                                                                ? <span className="fw-bold">{rulings[rulingId].hole}</span>
                                                                : (<>Hole <span className="fw-bold">#{rulings[rulingId].hole}</span></>)
                                                        }
                                                    </div>
                                                    <div>
                                                        Group <span className="fw-bold">#{rulings[rulingId].group}</span>
                                                        {' '}-{' '}
                                                        Players involved: <span className="fw-bold">{rulings[rulingId].playerName}</span>
                                                    </div>
                                                    <div>
                                                        Applied rules: <span className="fw-bold">{rulings[rulingId].rulesApplied}</span>
                                                    </div>
                                                    <div>
                                                        Additionnal comments: <span className="fw-bold">{rulings[rulingId].comment}</span>
                                                    </div>
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
                                                                    <Button className="float-end" size="sm" variant="primary" onClick={() => deleteRuling(rulingId)} disabled={isSaving}>
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
                                <Row>
                                    <Col sm={2}>
                                        <InputGroup>
                                            <InputGroup.Text className="">Hole</InputGroup.Text>
                                            <Form.Select
                                                type="text"
                                                placeholder="New event name"
                                                value={newRulingHole}
                                                onChange={(e) => setNewRulingHole(e.target.value)}>
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
                                                value={newRulingGroup}
                                                onChange={(e) => setNewRulingGroup(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col sm={8}>
                                        <InputGroup className="mb-1">
                                            <InputGroup.Text className="">Players involved</InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="John Doe and Tony Stark"
                                                value={newRulingPlayerName}
                                                onChange={(e) => setNewRulingPlayerName(e.target.value)}
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
                                                value={newRulingRulesApplied}
                                                onChange={(e) => setNewRulingRulesApplied(e.target.value)}
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
                                                value={newRulingComment}
                                                onChange={(e) => setNewRulingComment(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <div className={isSaving ? "p-2 alert alert-primary" : "d-none"}>
                                    [Saving...]
                                </div>
                                <Button variant="outline-primary" onClick={() => createRuling()} disabled={isSaving}>Save Ruling</Button>
                            </div>
                        </div>
                    </>
                    : ''
            }

        </>
    );
}