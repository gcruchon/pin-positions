import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import Alert from 'react-bootstrap/Alert';
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import { collection, onSnapshot, doc, query, orderBy, runTransaction, serverTimestamp } from "firebase/firestore";

import { db } from '../firebase';
import { useAuth } from '../hooks';
import { dateTimeOptions } from '../utils';
import './HoleHistory.css'

const ComparedValue = ({ hole, previousHole, field }) => {
  let className = "HoleHistory-same-value";
  let value = "";
  if (hole && field in hole) {
    value = hole[field];
    className = "HoleHistory-different-value";
    if (previousHole && field in previousHole && previousHole[field] === value) {
      className = "HoleHistory-same-value";
    }
  }

  return <span className={className}>{value}</span>
}

const EditedBy = ({ hole }) => {
  const { currentUser } = useAuth();

  let editor = "";
  if (hole && hole.createdBy) {
    editor = hole.createdBy;
  }
  if (hole && hole.updatedBy) {
    editor = hole.updatedBy;
  }

  return (currentUser && currentUser.email && editor === currentUser.email)
    ? "You"
    : editor
}

const EditedOn = ({ hole }) => {
  let r = "";
  if (hole && hole.created) {
    r = hole.created.toDate().toLocaleString("en-GB", dateTimeOptions);
  }
  if (hole && hole.updated) {
    r = hole.updated.toDate().toLocaleString("en-GB", dateTimeOptions);
  }
  return r;
}

const HoleValue = ({ hole, previousHole, current }) => {
  const { currentUser } = useAuth();

  const version = hole
    ? hole.version
    : 0;

  const restoreVersion = async () => {
    if (window.confirm(`Are you sure you want to restore v${hole.version}?`)) {
      const holeRef = doc(db, "holes", `${hole.eventId}|${hole.round}|${hole.hole}`);
      await runTransaction(db, async (transaction) => {
        const holeDoc = await transaction.get(holeRef);
        if (holeDoc.exists()) {
          const previousVersionOfHole = holeDoc.data();
          const currentVersion = previousVersionOfHole.version || 1;
          const historyRef = doc(
            db,
            "holes",
            `${hole.eventId}|${hole.round}|${hole.hole}`,
            "history",
            `${hole.eventId}|${hole.round}|${hole.hole}-v${currentVersion}`);
          const holeData = { ...hole };
          holeData["version"] = currentVersion + 1;
          holeData["updated"] = serverTimestamp();
          holeData["updatedBy"] = currentUser.email;
          transaction.set(historyRef, previousVersionOfHole);
          transaction.update(holeRef, holeData);

        } else {
          throw new Error(`Hole "${hole.eventId}|${hole.round}|${hole.hole}" does not exist`);
        }
      });
    }

  }

  return (
    hole
      ? <tr>
        <td>
          <ComparedValue hole={hole} previousHole={previousHole} field="distanceFromFront" />
          {' - '}
          <ComparedValue hole={hole} previousHole={previousHole} field="distanceFromSide" />
          {' '}
          <ComparedValue hole={hole} previousHole={previousHole} field="side" />
        </td>
        <td className="HoleHistory-version">v{version}</td>
        <td className="HoleHistory-date">
          <EditedOn hole={hole} />
        </td>
        <td className="HoleHistory-user">
          <EditedBy hole={hole} />
        </td>
        <td className="text-center">
          {
            current
              ? <span className="fw-bold">Current value</span>
              : <Button onClick={() => restoreVersion()} size="sm" variant="outline-primary">Restore</Button>
          }
        </td>
      </tr>
      : <tr>
        <td colSpan={5} className="HoleHistory-no-history">No history for now</td>
      </tr>
  );
}

export const HoleHistory = () => {

  const { eventId, round, hole } = useParams();
  const { hash } = useLocation();
  const [historyHoles, setHistoryHoles] = useState([]);
  const [currentHole, setCurrentHole] = useState(null);
  const [historyHolesLoadingStatus, setHistoryHolesLoadingStatus] = useState("syncing");
  const [currentHoleLoadingStatus, setCurrentHoleLoadingStatus] = useState("syncing");
  const [historyPageStatus, setHistoryPageStatus] = useState("syncing");
  const navigate = useNavigate();

  const backUrl = hash === "#fromPins"
    ? `/events/${eventId}/pins#hole_${hole}`
    : `/events/${eventId}/round/${round}`;


  useEffect(() => {
    const holesRef = collection(db, `holes/${eventId}|${round}|${hole}/history`);
    const q = query(holesRef, orderBy("version", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let holes = [];
      snapshot.forEach((doc) => {
        holes.push(doc.data());
      })
      setHistoryHoles(holes);
      setHistoryHolesLoadingStatus("loaded");
    },
      (error) => {
        console.error(error);
        setHistoryHolesLoadingStatus("error");
      });
    return () => unsubscribe();
  }, [eventId, hole, round]);

  useEffect(() => {
    const currentHoleRef = doc(db, `holes/${eventId}|${round}|${hole}`);
    const unsubscribe = onSnapshot(currentHoleRef, (snapshot) => {
      setCurrentHole(snapshot.data());
      setCurrentHoleLoadingStatus("loaded");
    },
      (error) => {
        console.error(error);
        setCurrentHoleLoadingStatus("error");
      });
    return () => unsubscribe();
  }, [eventId, hole, round]);

  useEffect(() => {
    if (historyHolesLoadingStatus === "loaded" && currentHoleLoadingStatus === "loaded") {
      setHistoryPageStatus("loaded");
    } else if (historyHolesLoadingStatus === "error" || currentHoleLoadingStatus === "error") {

    } else {
      setHistoryPageStatus("syncing");
    }
  }, [historyHolesLoadingStatus, currentHoleLoadingStatus]);

  return (
    <>
      <Container className={historyPageStatus === "loaded" ? "" : "d-none"} fluid>
        <h5>Hole History</h5>
        <h6>Round N°{round} {">"} Hole # {hole}</h6>
        <Button onClick={() => navigate(backUrl)} size="sm" className="mb-2">Back</Button>
        <Table striped={true} bordered={true} hover={true} size="sm">
          <thead>
            <tr>
              <th>
                Previous values
              </th>
              <th>
                Version
              </th>
              <th>
                Edited on
              </th>
              <th className="fst-italic">
                Edited by
              </th>
              <th>
              </th>
            </tr>
          </thead>
          <tbody>
            {
              historyHoles.length
                ? <HoleValue hole={currentHole} previousHole={historyHoles[0]} current={true} />
                : <HoleValue hole={currentHole} previousHole={null} current={true} />
            }
            {
              historyHoles.map((hole, i, arr) => {
                const previousHole = (i === historyHoles.length - 1)
                  ? null
                  : arr[i + 1];
                return (
                  <HoleValue hole={hole} previousHole={previousHole} key={`history-${i}`} current={false} />
                )
              })
            }
          </tbody>
        </Table>
        <Button onClick={() => navigate(backUrl)} size="sm">Back</Button>
      </Container>
      <Alert show={historyPageStatus === "syncing"} variant="warning">Loading history...</Alert>
      <Alert show={historyPageStatus === "not-found"} variant="danger">Error, please reload page</Alert>
    </>
  );
}