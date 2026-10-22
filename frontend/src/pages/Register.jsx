import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        login: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        // Basic client-side validation
        if (formData.password !== formData.password_confirmation) {
            return setStatus({ type: 'error', message: 'Passwords do not match' });
        }

        try {
            // Send registration request to the backend
            const response = await api.post('/auth/register', formData);
            
            // Show success message
            setStatus({ type: 'success', message: response.data.message });
            
            // Clear form
            setFormData({ login: '', email: '', password: '', password_confirmation: '' });
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: err.response?.data?.error || 'Failed to register' 
            });
        }
    };

    return (
        <div className="register-container" style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '50px' }}>
            <h2>Create an Account</h2>
            
            {status.message && (
                <div style={{ 
                    color: status.type === 'error' ? 'red' : 'green', 
                    marginBottom: '15px',
                    padding: '10px',
                    border: `1px solid ${status.type === 'error' ? 'red' : 'green'}`
                }}>
                    {status.message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Username</label>
                    <input type="text" name="login" value={formData.login} onChange={handleChange} required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Confirm Password</label>
                    <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required />
                </div>

                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Register</button>
            </form>

            <p style={{ marginTop: '20px' }}>
                Already have an account? <Link to="/login">Sign in here</Link>
            </p>
        </div>
    );
};

export default Register;