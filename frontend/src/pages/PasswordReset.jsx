import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const PasswordReset = () => {
    const { token: pathToken } = useParams();
    const [searchParams] = useSearchParams();
    const queryToken = searchParams.get('token');

    // Extract token from either URL path parameter or query string
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
                message: response.data?.message || 'Password reset successfully! Redirecting to login...'
            });

            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.error || 'Invalid or expired password reset token.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div style={styles.card}>
                <h2>Invalid Request</h2>
                <p style={{ color: 'red', margin: '15px 0' }}>
                    Password reset token is missing from the link URL.
                </p>
                <Link to="/password-reset-request">Request a new link</Link>
            </div>
        );
    }

    return (
        <div style={styles.card}>
            <h2>Set New Password</h2>

            {status.message && (
                <div style={{
                    padding: '10px',
                    marginBottom: '15px',
                    color: status.type === 'error' ? 'red' : 'green',
                    border: `1px solid ${status.type === 'error' ? 'red' : 'green'}`
                }}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                    <label>New Password</label>
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
                    <label>Confirm New Password</label>
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
                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
};

const styles = {
    card: { maxWidth: '400px', margin: '50px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    field: { display: 'flex', flexDirection: 'column', gap: '5px' },
    input: { padding: '10px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc' },
    submitBtn: { padding: '10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' },
    footer: { marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }
};

export default PasswordReset;