import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { AuthLayout } from './components/AuthLayout'
import { Event } from './components/Event'
import { EventList } from './components/EventList'
import { EventDetails } from './components/EventDetails';
import { Welcome } from './components/Welcome';

import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Welcome />,
      },
      {
        path: "events",
        element: <EventList />,
      },
      {
        path: "events/:eventId",
        element: <Event />,
      },
      {
        path: "events/:eventId/details",
        element: <EventDetails />,
      },
    ]
  },

]);

const App = () => {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
