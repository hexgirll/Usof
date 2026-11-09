import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const PasswordReset = () => {
    const { token: pathToken } = useParams();
    const [searchParams] = useSearchParams();
    const queryToken = searchParams.get('token');

    const token = pathToken || queryToken;
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            return setStatus({ type: 'error', message: 'Missing or invalid reset token.' });
        }

        if (password !== confirmPassword) {
            return setStatus({ type: 'error', message: 'Passwords do not match.' });
        }

        if (password.length < 6) {
            return setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.post(`/auth/password-reset/${token}`, { password });
            setStatus({
                type: 'success',
                message: response.data?.message || 'Password reset successfully! Redirecting...'
            });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.error || 'Invalid or expired password reset token.'
            });
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div style={styles.pageContainer}>
                <div style={{ ...styles.card, textAlign: 'center' }}>
                    <h2 style={styles.title}>Invalid Request</h2>
                    <p style={{ ...styles.description, color: '#e74c3c' }}>
                        Password reset token is missing from the link URL.
                    </p>
                    <Link to="/password-reset-request" style={{ ...styles.submitBtn, backgroundColor: '#3498db', textDecoration: 'none', display: 'inline-block', marginTop: '15px' }}>
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h2 style={styles.title}>Set New Password</h2>
                <p style={styles.description}>Create a new, strong password for your account.</p>

                {status.message && (
                    <div style={{
                        ...styles.messageBox,
                        backgroundColor: status.type === 'error' ? '#ffebee' : '#e8f5e9',
                        color: status.type === 'error' ? '#c0392b' : '#27ae60',
                    }}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                        {isSubmitting ? 'Updating...' : 'Set Password'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <Link to="/login" style={styles.link}>← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: { minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { width: '100%', maxWidth: '420px', padding: '40px 30px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #eaeaea', boxSizing: 'border-box' },
    title: { color: '#2c3e50', fontSize: '1.8em', marginBottom: '10px', fontWeight: '700', textAlign: 'center' },
    description: { color: '#7f8c8d', fontSize: '0.95em', marginBottom: '25px', textAlign: 'center', lineHeight: '1.5' },
    messageBox: { padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9em', fontWeight: '600', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.9em', fontWeight: '600', color: '#34495e' },
    input: { padding: '14px 16px', fontSize: '1em', borderRadius: '8px', border: '1px solid #ccd1d9', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', width: '100%' },
    submitBtn: { width: '100%', padding: '14px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontSize: '1.05em', fontWeight: 'bold', transition: 'opacity 0.2s' },
    footer: { marginTop: '25px', textAlign: 'center' },
    link: { color: '#7f8c8d', textDecoration: 'none', fontSize: '0.95em', fontWeight: '600', transition: 'color 0.2s' }
};

export default PasswordReset;