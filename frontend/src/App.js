import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout } from './redux/authSlice';
import api from './services/api';

import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SinglePost from './pages/SinglePost';
import ConfirmEmail from './pages/ConfirmEmail';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordReset from './pages/PasswordReset';
import EditPost from './pages/EditPost';
import PublicProfile from './pages/PublicProfile';

function App() {
  const dispatch = useDispatch();
  // Removed unused 'isAuthenticated' variable to resolve React build warning
  const { token } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Function to load user data if token exists
    const loadUser = async () => {
      if (token) {
        try {
          // 1. Check if token is valid and get user ID
          const authRes = await api.get('/auth/me');
          const userId = authRes.data.userData.id;

          // 2. Fetch full user profile details
          const userRes = await api.get(`/users/${userId}`);
          
          // 3. Save full user data to Redux global state
          dispatch(setUser(userRes.data));
        } catch (error) {
          console.error('Failed to authenticate token:', error);
          
          // Only log out if the token is explicitly invalid or expired (401/403)
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            dispatch(logout());
          }
        }
      }
      // Stop the loading indicator
      setIsInitializing(false);
    };

    loadUser();
  }, [token, dispatch]);

  if (isInitializing) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="confirm-email" element={<ConfirmEmail />} />
        <Route path="posts/create" element={<CreatePost />} />
        <Route path="posts/:id" element={<SinglePost />} />
        <Route path="profile" element={<Profile />} />
        <Route path="password-reset-request" element={<PasswordResetRequest />} />
        <Route path="password-reset" element={<PasswordReset />} />
        <Route path="password-reset/:token" element={<PasswordReset />} />
        <Route path="posts/:id/edit" element={<EditPost />} />
        <Route path="users/:id" element={<PublicProfile />} />
      </Route>
    </Routes>
  );
}

export default App;