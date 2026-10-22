import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    // 1. Local state for storing form inputs and error messages
    const [formData, setFormData] = useState({
        login: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);

    // 2. Hooks for Redux dispatch and React Router navigation
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 3. Universal handler for input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 4. Form submit handler
    const handleSubmit = async (e) => {
        // Prevent default page reload
        e.preventDefault();
        setError(null);

        try {
            // Send POST request to our backend
            const response = await api.post('/auth/login', formData);
            
            // Save token to Redux global state and localStorage
            dispatch(loginSuccess({
                token: response.data.token,
                user: null // User details will be fetched later in a separate request
            }));

            // Redirect user to the home page after successful login
            navigate('/');
        } catch (err) {
            // Display error message from backend or a fallback message
            setError(err.response?.data?.error || 'Failed to login');
        }
    };

    return (
        <div className="login-container">
            <h2>Sign In to GeoChill</h2>
            
            {/* Conditional rendering for error message */}
            {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        name="login" 
                        value={formData.login} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <button type="submit">Login</button>
            </form>

            <Link to="/password-reset-request" style={{ fontSize: '0.85em', color: '#3498db' }}>
                Forgot password?
            </Link>
        </div>
    );
};

export default Login;