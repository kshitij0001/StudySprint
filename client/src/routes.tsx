import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Syllabus from './pages/Syllabus';
import Calendar from './pages/Calendar';
import Files from './pages/Files';
import Tests from './pages/Tests';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import NotFound from './pages/not-found';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Dashboard /></Layout>,
    errorElement: <Layout><NotFound /></Layout>,
  },
  {
    path: '/plan',
    element: <Layout><Syllabus /></Layout>,
  },
  {
    path: '/calendar',
    element: <Layout><Calendar /></Layout>,
  },
  {
    path: '/files',
    element: <Layout><Files /></Layout>,
  },
  {
    path: '/tests',
    element: <Layout><Tests /></Layout>,
  },
  {
    path: '/progress',
    element: <Layout><Progress /></Layout>,
  },
  {
    path: '/settings',
    element: <Layout><Settings /></Layout>,
  },
], {
  basename: import.meta.env.VITE_BASE_URL || '/'
});

export function AppRouter() {
  return <RouterProvider router={router} />;
}
