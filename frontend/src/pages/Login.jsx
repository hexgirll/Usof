import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({
        login: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await api.post('/auth/login', formData);

            dispatch(loginSuccess({
                token: response.data.token,
                user: null
            }));

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome to GeoChill</h2>
                <p style={styles.subtitle}>Sign in to share your favorite spots</p>
                
                {error && <div style={styles.errorMessage}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Username</label>
                        <input 
                            type="text" 
                            name="login" 
                            value={formData.login} 
                            onChange={handleChange} 
                            required 
                            style={styles.input}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" style={styles.submitBtn}>Sign In</button>
                </form>

                <div style={styles.footerLink}>
                    <Link to="/password-reset-request" style={styles.link}>
                        Forgot password?
                    </Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        padding: '20px',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        padding: '35px 30px',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        border: '1px solid #eaeaea',
        boxSizing: 'border-box',
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '1.6em',
        color: '#2c3e50',
        textAlign: 'center',
        fontWeight: '700',
    },
    subtitle: {
        margin: '0 0 25px 0',
        fontSize: '0.95em',
        color: '#7f8c8d',
        textAlign: 'center',
    },
    errorMessage: {
        padding: '10px 14px',
        marginBottom: '20px',
        borderRadius: '8px',
        backgroundColor: '#ffebee',
        color: '#c0392b',
        fontSize: '0.9em',
        textAlign: 'center',
        fontWeight: '600',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '0.9em',
        fontWeight: '600',
        color: '#34495e',
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        boxSizing: 'border-box',
        borderRadius: '8px',
        border: '1px solid #ccd1d9',
        fontSize: '0.95em',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit',
    },
    submitBtn: {
        marginTop: '10px',
        width: '100%',
        padding: '12px',
        backgroundColor: '#3498db',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        fontSize: '1em',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s, opacity 0.2s',
    },
    footerLink: {
        marginTop: '20px',
        textAlign: 'center',
    },
    link: {
        fontSize: '0.88em',
        color: '#3498db',
        textDecoration: 'none',
        fontWeight: '600',
    }
};

export default Login;