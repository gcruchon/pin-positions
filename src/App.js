import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Container from 'react-bootstrap/Container';

import { Welcome } from './components/Welcome'
import { Event } from './components/Event'
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/events/:eventId",
    element: <Event />,
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
