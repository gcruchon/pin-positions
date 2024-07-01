import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';

const DistanceInput = ({ distance, setDistance, setSaveToBase }) => {
  const handleDistance = (newDistance) => {
    const distance = newDistance.replace(/\D+/g, '');
    setDistance(distance);
  }

  return (
    <input
      type="text"
      pattern="[0-9]*"
      value={distance}
      onChange={(e) => handleDistance(e.target.value)}
      onBlur={(e) => setSaveToBase(true)}
    />)
}

const SideButton = ({ side, handleSide, getSideButtonClassName }) => {
  return (
    <button type="button" className={getSideButtonClassName(side)} onClick={async () => await handleSide(side)}>&#160;&#160;{side}&#160;&#160;</button>
  )
}

export const Hole = ({ eventId, round, hole, value }) => {
  console.log("round", round, "hole", hole, "value", value);
  const [distanceFromFront, setDistanceFromFront] = useState("");
  const [distanceFromSide, setDistanceFromSide] = useState("");
  const [side, setSide] = useState("");
  const [saveToBase, setSaveToBase] = useState(false);

  const getHoleId = useCallback(() => `${eventId}|${round}|${hole}`, [eventId, round, hole]);

  const getSideButtonClassName = (desiredSide) => {
    let className = "btn ";
    if (desiredSide === side) {
      className += "btn-primary";
    } else {
      className += "btn-outline-primary";
    }
    return className;
  }

  const handleSide = async (newSide) => {
    setSide(newSide);
    setSaveToBase(true);
  }

  useEffect(() => {
    setDistanceFromFront(value.distanceFromFront || "");
    setDistanceFromSide(value.distanceFromSide || "");
    setSide(value.side || "");
  }, [value]);

  // useEffect(() => {
  //   // console.log("state updated", distanceFromFront, distanceFromSide, side);
  //   const saveHole = async () => {
  //     // console.log("Save");
  //     await setDoc(doc(db, "holes", getHoleId()), {
  //       eventId,
  //       round,
  //       hole,
  //       distanceFromFront,
  //       distanceFromSide,
  //       side,
  //     });
  //     setSaveToBase(false);
  //   };
  //   if (saveToBase) saveHole();
  // }, [distanceFromFront, distanceFromSide, eventId, hole, round, saveToBase, side, getHoleId]);

  return (
    <div className="row m-3">
      <div className="col-sm text-right">{hole}</div>
      <div className="col-sm">
        <DistanceInput distance={distanceFromFront} setDistance={setDistanceFromFront} setSaveToBase={setSaveToBase} />
      </div>
      <div className="col-sm">
        <DistanceInput distance={distanceFromSide} setDistance={setDistanceFromSide} setSaveToBase={setSaveToBase} />
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