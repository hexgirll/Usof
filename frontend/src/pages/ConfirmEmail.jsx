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
                    message: 'Confirmation token is missing. Please check your email link.'
                });
                return;
            }

            try {
                const response = await api.get(`/auth/confirm/${token}`);
                setStatus({
                    loading: false,
                    success: true,
                    message: response.data.message || 'Your email has been successfully confirmed!'
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
        return (
            <div style={styles.pageContainer}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Verifying Email...</h2>
                    <p style={styles.description}>Please wait while we confirm your email address.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h2 style={styles.title}>Email Confirmation</h2>
                
                <div style={{
                    ...styles.messageBox,
                    backgroundColor: status.success ? '#e8f5e9' : '#ffebee',
                    color: status.success ? '#27ae60' : '#c0392b',
                    border: `1px solid ${status.success ? '#27ae60' : '#c0392b'}`
                }}>
                    {status.message}
                </div>

                {status.success ? (
                    <Link to="/login" style={{ ...styles.btn, backgroundColor: '#2ecc71' }}>
                        Go to Login
                    </Link>
                ) : (
                    <Link to="/register" style={{ ...styles.btn, backgroundColor: '#e74c3c' }}>
                        Back to Register
                    </Link>
                )}
            </div>
        </div>
    );
};

const styles = {
    pageContainer: { minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { width: '100%', maxWidth: '420px', padding: '40px 30px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #eaeaea', textAlign: 'center', boxSizing: 'border-box' },
    title: { color: '#2c3e50', fontSize: '1.8em', marginBottom: '15px', fontWeight: '700' },
    description: { color: '#7f8c8d', fontSize: '1em', marginBottom: '20px' },
    messageBox: { padding: '15px', borderRadius: '8px', marginBottom: '25px', fontSize: '0.95em', fontWeight: '600', lineHeight: '1.5' },
    btn: { display: 'inline-block', width: '100%', padding: '14px', borderRadius: '25px', color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.05em', boxSizing: 'border-box', transition: 'opacity 0.2s', cursor: 'pointer' }
};

export default ConfirmEmail;