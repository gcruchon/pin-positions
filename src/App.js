import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

import { Round } from './components/Round'
import { collection, where, query, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';


import './App.css';

const App = () => {

  const eventId = "testEvent";

  const [displayedRound, setDisplayedRound] = useState(1);
  const [holes, setHoles] = useState([]);

  const getActiveClass = (round) => {
    if (displayedRound === round) {
      return "active font-weight-bold"
    }
    return "";
  }
  useEffect(() => {
    const holesRef = collection(db, "holes");
    const q = query(holesRef, where("eventId", "==", eventId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let holes = {};
      querySnapshot.forEach((doc) => {
        holes[doc.id] = doc.data();
      });
      setHoles(holes);
      console.log("holes", holes);
    });
  }, [])

  return (
    <Container>
      <h1>
        Pin positions
      </h1>
      <Nav variant="tabs" defaultActiveKey="/home">
        <Nav.Item>
          <Nav.Link className={getActiveClass(1)} onClick={() => setDisplayedRound(1)}>Round N°1</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link className={getActiveClass(2)} onClick={() => setDisplayedRound(2)}>Round N°2</Nav.Link>
        </Nav.Item>
      </Nav>

      <Round
        eventId={eventId}
        round={1} 
        roundDate={new Date()} 
        dotColor={"red"} 
        isVisible={displayedRound === 1} 
        holes={holes} />
      <Round 
        eventId={eventId} 
        round={2} 
        roundDate={new Date()} 
        dotColor={"white"} 
        isVisible={displayedRound === 2} 
        holes={holes} />

    </Container>
  );
}

export default App;
