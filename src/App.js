import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { AuthLayout } from './components/AuthLayout'
import { Event } from './components/Event'
import { EventList } from './components/EventList'
import { EventDetails } from './components/EventDetails';
import { Login, loader as loginLoader } from './components/Login';
import { Welcome } from './components/Welcome';

import { requireAuth } from './requireAuth';

import './App.css';
import { HoleHistory } from './components/HoleHistory';

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
        path: "login",
        element: <Login />,
        loader: loginLoader
      },
      {
        path: "events",
        element: <EventList />,
        loader: async ({ request }) => await requireAuth(request),
      },
      {
        path: "events/:eventId",
        element: <Event />,
        loader: async ({ request }) => await requireAuth(request),
      },
      {
        path: "events/:eventId/details",
        element: <EventDetails />,
        loader: async ({ request }) => await requireAuth(request),
      },
      {
        path: "events/:eventId/round/:round/hole/:hole/history",
        element: <HoleHistory />,
        loader: async ({ request }) => await requireAuth(request),
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
