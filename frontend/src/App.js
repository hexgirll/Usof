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
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import SingleNews from './pages/SingleNews';

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const authRes = await api.get('/auth/me');
          const userId = authRes.data.userData.id;

          const userRes = await api.get(`/users/${userId}`);

          dispatch(setUser(userRes.data));
        } catch (error) {
          console.error('Failed to authenticate token:', error);

          // A network error should not log the user out
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            dispatch(logout());
          }
        }
      }
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
        <Route element={<ProtectedRoute />}>
            <Route path="posts/create" element={<CreatePost />} />
            <Route path="profile" element={<Profile />} />
            <Route path="posts/:id/edit" element={<EditPost />} />
        </Route>
        <Route path="posts/:id" element={<SinglePost />} />
        <Route path="password-reset-request" element={<PasswordResetRequest />} />
        <Route path="password-reset" element={<PasswordReset />} />
        <Route path="password-reset/:token" element={<PasswordReset />} />
        <Route path="users/:id" element={<PublicProfile />} />
        <Route path="/news/:id" element={<SingleNews />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;