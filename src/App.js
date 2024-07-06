import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Container from 'react-bootstrap/Container';

import { Welcome } from './components/Welcome'
import { Event } from './components/Event'
import { EventList } from './components/EventList'
import './App.css';
import { EventDetails } from './components/EventDetails';

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

const App = () => {
  return (
    <React.StrictMode>
      <Container>
        <h1>
          Pin positions
        </h1>
        <RouterProvider router={router} />
      </Container>
    </React.StrictMode>
  );
}

export default App;
