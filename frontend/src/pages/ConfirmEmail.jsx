import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const ConfirmEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState({ loading: true, success: false, message: '' });

    useEffect(() => {
        const confirmEmailToken = async () => {
            if (!token) {
                setStatus({
                    loading: false,
                    success: false,
                    message: 'Confirmation token is missing.'
                });
                return;
            }

            try {
                const response = await api.get(`/auth/confirm/${token}`);
                setStatus({
                    loading: false,
                    success: true,
                    message: response.data.message || 'Email confirmed successfully!'
                });
            } catch (error) {
                setStatus({
                    loading: false,
                    success: false,
                    message: error.response?.data?.error || 'Invalid or expired confirmation token.'
                });
            }
        };

        confirmEmailToken();
    }, [token]);

    if (status.loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Confirming your email...</div>;
    }

    return (
        <div style={styles.card}>
            <h2>Email Confirmation</h2>
            <p style={{ color: status.success ? 'green' : 'red', margin: '20px 0' }}>
                {status.message}
            </p>
            {status.success ? (
                <Link to="/login" style={styles.loginBtn}>
                    Go to Login
                </Link>
            ) : (
                <Link to="/register" style={styles.registerBtn}>
                    Back to Register
                </Link>
            )}
        </div>
    );
};

const styles = {
    card: { maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
    loginBtn: { padding: '8px 16px', backgroundColor: '#2ecc71', color: '#fff', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' },
    registerBtn: { padding: '8px 16px', backgroundColor: '#e74c3c', color: '#fff', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }
};

export default ConfirmEmail;