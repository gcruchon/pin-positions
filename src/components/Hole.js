import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, serverTimestamp, runTransaction } from "firebase/firestore";
import { db } from '../firebase';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup'

import { useAuth } from '../hooks';
import './Hole.css';

const DistanceInput = ({ distance, distanceType, saveDistanceToBase }) => {
  const initialDistance = distance;
  const cleanDistance = (newDistance) => {
    return newDistance.replace(/\D+/g, '');
  }

  return (
    <Form.Control
      type="text"
      pattern="[0-9]*"
      size="3"
      defaultValue={distance}
      onBlur={(e) => saveDistanceToBase(cleanDistance(initialDistance), e.target.value, distanceType)} />
  )
}

const SideButton = ({ side, handleSide, getSideButtonClassName }) => {
  return (
    <button type="button" className={getSideButtonClassName(side)} onClick={async () => await handleSide(side)}>&#160;{side}&#160;</button>
  )
}

export const Hole = ({ hole, value }) => {
  const { eventId, round } = useParams();
  const { currentUser } = useAuth();

  const [distanceFromFront, setDistanceFromFront] = useState("");
  const [distanceFromSide, setDistanceFromSide] = useState("");
  const [side, setSide] = useState("");
  const [dbState, setDbState] = useState("saved");

  const getSideButtonClassName = (newSide) => {
    let className = "btn ";
    if (newSide === side) {
      className += "btn-primary";
    } else {
      className += "btn-outline-primary";
    }
    return className;
  }

  const handleSide = async (newSide) => {
    setSide(newSide);
    await saveFieldToBase("side", newSide);
  }

  const saveDistanceToBase = async (initialDistance, newDistance, distanceType) => {
    if (initialDistance !== newDistance) {
      switch (distanceType) {
        case "fromFront":
          await saveFieldToBase("distanceFromFront", newDistance);
          break;
        case "fromSide":
          await saveFieldToBase("distanceFromSide", newDistance);
          break;
        default:
          console.error("Unknown distance type: ", distanceType);
      }
    }
  }
  const saveFieldToBase = async (fieldId, fieldValue) => {
    setDbState("saving");
    const holeData = {}
    holeData[fieldId] = fieldValue;

    const holeRef = doc(db, "holes", `${eventId}|${round}|${hole}`);
    await runTransaction(db, async (transaction) => {
      const holeDoc = await transaction.get(holeRef);
      if (holeDoc.exists()) {
        const previousVersionOfHole = holeDoc.data();
        const currentVersion = previousVersionOfHole.version || 1;
        const historyRef = doc(
          db,
          "holes",
          `${eventId}|${round}|${hole}`,
          "history",
          `${eventId}|${round}|${hole}-v${currentVersion}`)
        holeData["version"] = currentVersion + 1;
        holeData["updated"] = serverTimestamp();
        holeData["updatedBy"] = currentUser.email;
        transaction.set(historyRef, previousVersionOfHole);
        transaction.update(holeRef, holeData);

      } else {
        holeData["eventId"] = eventId;
        holeData["round"] = round;
        holeData["hole"] = hole;
        holeData["created"] = serverTimestamp();
        holeData["createdBy"] = currentUser.email;
        holeData["version"] = 1;
        transaction.set(holeRef, holeData);
      }
    });
  };

  useEffect(() => {
    setDistanceFromFront(value.distanceFromFront || "");
    setDistanceFromSide(value.distanceFromSide || "");
    setSide(value.side || "");
    setDbState("saved")
  }, [value]);

  return (
    <div className={`mb-4 Hole-db-${dbState}`}>
      <InputGroup>
        <InputGroup.Text id="basic-addon2">
          <Link className="Hole-link" to={`/events/${eventId}/round/${round}/hole/${hole}/history`}># {hole}</Link>
        </InputGroup.Text>
        <DistanceInput distance={distanceFromFront} distanceType="fromFront" saveDistanceToBase={saveDistanceToBase} />
        <InputGroup.Text id="basic-addon2"> - </InputGroup.Text>
        <DistanceInput distance={distanceFromSide} distanceType="fromSide" saveDistanceToBase={saveDistanceToBase} />
        <SideButton side={'L'} handleSide={handleSide} getSideButtonClassName={getSideButtonClassName} />
        <SideButton side={'C'} handleSide={handleSide} getSideButtonClassName={getSideButtonClassName} />
        <SideButton side={'R'} handleSide={handleSide} getSideButtonClassName={getSideButtonClassName} />
      </InputGroup>
    </div>
  );
}