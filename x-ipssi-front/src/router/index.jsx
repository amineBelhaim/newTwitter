import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/home';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import MainLayout from '../layout/MainLayout';
import Profile from '../pages/profil';
import Messages from '../pages/messages';
import UserProfile from '../pages/profil/userProfile';
import Notifications from '../pages/Notifications';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/explore',
        element: (
          <ProtectedRoute>
            <div>Explorer</div>
          </ProtectedRoute>
        )
      },
      {
        path: '/notifications',
        element: (
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        )
      },
      {
        path: '/messages',
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        )
      },
      {
        path: '/bookmarks',
        element: (
          <ProtectedRoute>
            <div>Signets</div>
          </ProtectedRoute>
        )
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: '/profile/:userId',
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        )
      },
      
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      }
    ]
  }
]);
