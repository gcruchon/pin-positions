import React, { useEffect, useState, createContext } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Container from 'react-bootstrap/Container';
import { onAuthStateChanged } from "firebase/auth";

import { Welcome } from './components/Welcome'
import { Event } from './components/Event'
import { EventList } from './components/EventList'
import { EventDetails } from './components/EventDetails';
import { SignIn } from './components/SignIn';
import { Header } from './components/Header';

import './App.css';

import { auth } from './firebase';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/events",
    element: <EventList />,
  },
  {
    path: "/events/:eventId",
    element: <Event />,
  },
  {
    path: "/events/:eventId/details",
    element: <EventDetails />,
  },
]);
export const AppContext = createContext();

const App = () => {

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        console.log("user", user)
      } else {
        console.log("user is logged out")
      }
    });

  }, [])
  return (
    <React.StrictMode>
      <AppContext.Provider value={currentUser}>
        <Header />
        <Container fluid>
          {
            currentUser
              ? <RouterProvider router={router} />
              : <SignIn />
          }
        </Container>
      </AppContext.Provider>
    </React.StrictMode>
  );
}

export default App;
