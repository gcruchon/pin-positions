import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { requireAuth } from './requireAuth';
import { AuthLayout } from './components/AuthLayout'
import { Course } from './components/Course'
import { CourseDetails } from './components/CourseDetails';
import { CourseList } from './components/CourseList'
import { CourseTimePar } from './components/CourseTimePar';
import { Event } from './components/Event'
import { EventList } from './components/EventList'
import { EventDetails } from './components/EventDetails';
import { HoleHistory } from './components/HoleHistory';
import { Login, loader as loginLoader } from './components/Login';
import { Pins } from './components/Pins';
import { Round } from './components/Round';
import { RoundDraw } from './components/RoundDraw';
import { RoundPins } from './components/RoundPins';
import { RoundStats } from './components/RoundStats';
import { RoundRulings } from './components/RoundRulings';
import { RoundTimesheet } from './components/RoundTimesheet';
import { UserList } from './components/UserList';
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
        path: "login",
        element: <Login />,
        loader: loginLoader
      },
      {
        path: "users",
        element: <UserList />,
        loader: async ({ request }) => await requireAuth(request),
      },
      {
        path: "courses",
        element: <CourseList />,
        loader: async ({ request }) => await requireAuth(request),
      },
      {
        path: "courses/:courseId",
        element: <Course />,
        loader: async ({ request }) => await requireAuth(request),
        children: [
          {
            index: true,
            element: <Navigate to="details" replace />,
          },
          {
            path: "details",
            element: <CourseDetails />,
            loader: async ({ request }) => await requireAuth(request),
          },
          {
            path: "timepar",
            element: <CourseTimePar />,
            loader: async ({ request }) => await requireAuth(request),
          },
        ]
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
        children: [
          {
            index: true,
            element: <Navigate to="round/1" replace />,
          },
          {
            path: "pins",
            element: <Pins />,
            loader: async ({ request }) => await requireAuth(request),
          },
          {
            path: "round/:round",
            element: <Round />,
            loader: async ({ request }) => await requireAuth(request),
            children: [
              {
                index: true,
                element: <Navigate to="pins" replace />,
              },
              {
                path: "pins",
                element: <RoundPins />,
                loader: async ({ request }) => await requireAuth(request),
              },
              {
                path: "stats",
                element: <RoundStats />,
                loader: async ({ request }) => await requireAuth(request),
              },
              {
                path: "rulings",
                element: <RoundRulings />,
                loader: async ({ request }) => await requireAuth(request),
              },
              {
                path: "draw",
                element: <RoundDraw />,
                loader: async ({ request }) => await requireAuth(request),
              },
              {
                path: "timesheet",
                element: <RoundTimesheet />,
                loader: async ({ request }) => await requireAuth(request),
              },
            ]
          },
        ]
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

], {
  future: {
    v7_relativeSplatPath: true,
    v7_skipActionErrorRevalidation: true,
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }} />
    </React.StrictMode>
  );
}

export default App;
