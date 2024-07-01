import { useState, useEffect, useContext } from "react";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';
import { EventContext } from "./Event";
import { RoundContext } from "./Round";
import './Hole.css';

const DistanceInput = ({ distance, distanceType, saveDistanceToBase }) => {
  const initialDistance = distance;
  const cleanDistance = (newDistance) => {
    return newDistance.replace(/\D+/g, '');
  }

  return (
    <input
      type="text"
      pattern="[0-9]*"
      defaultValue={distance}
      onBlur={(e) => saveDistanceToBase(cleanDistance(initialDistance), e.target.value, distanceType)}
    />)
}

const SideButton = ({ side, handleSide, getSideButtonClassName }) => {
  return (
    <button type="button" className={getSideButtonClassName(side)} onClick={async () => await handleSide(side)}>&#160;&#160;{side}&#160;&#160;</button>
  )
}

export const Hole = ({ hole, value }) => {
  const eventId = useContext(EventContext);
  const round = useContext(RoundContext);

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
    console.log("saveDistanceToBase", initialDistance, newDistance, distanceType);
    if (initialDistance !== newDistance) {
      switch(distanceType) {
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
    console.log("saveFieldToBase", fieldId, fieldValue);
    const holeData = {}
    holeData[fieldId] = fieldValue;
    holeData["updated"] = serverTimestamp();

    const holeRef = doc(db, "holes", `${eventId}|${round}|${hole}`);
    const holeSnapshot = await getDoc(holeRef);
    if (holeSnapshot.exists()) {
      await updateDoc(holeRef, holeData);
    } else {
      holeData["eventId"] = eventId;
      holeData["round"] = round;
      holeData["hole"] = hole;
      holeData["created"] = serverTimestamp();
      await setDoc(holeRef, holeData);
    }
  };

  useEffect(() => {
    setDistanceFromFront(value.distanceFromFront || "");
    setDistanceFromSide(value.distanceFromSide || "");
    setSide(value.side || "");
    setDbState("saved")
  }, [value]);

  return (
    <div className={`row m-3 Hole-db-${dbState}`}>
      <div className="col-sm text-right">{hole}</div>
      <div className="col-sm">
        <DistanceInput distance={distanceFromFront} distanceType="fromFront" saveDistanceToBase={saveDistanceToBase} />
      </div>
      <div className="col-sm">
        <DistanceInput distance={distanceFromSide} distanceType="fromSide" saveDistanceToBase={saveDistanceToBase} />
      </div>
      <div className="col-sm">
        <div className="btn-group" role="group" aria-label="Choose side">
          <SideButton side={'L'} handleSide={handleSide} getSideButtonClassName={getSideButtonClassName} />
          <SideButton side={'C'} handleSide={handleSide} getSideButtonClassName={getSideButtonClassName} />
          <SideButton side={'R'} handleSide={handleSide} getSideButtonClassName={getSideButtonClassName} />
        </div>
      </div>
    </div>
  );
}