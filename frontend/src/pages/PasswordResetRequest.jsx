import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const PasswordResetRequest = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.post('/auth/password-reset', { email });
            setStatus({
                type: 'success',
                message: response.data?.message || 'Password reset link has been sent to your email.'
            });
            setEmail('');
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.error || 'Failed to send password reset request.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.card}>
            <h2>Reset Password</h2>
            <p style={styles.description}>
                Enter your email address below and we will send you a link to reset your password.
            </p>

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
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        style={styles.input}
                    />
                </div>

                <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
    description: { color: '#666', fontSize: '0.9em', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    field: { display: 'flex', flexDirection: 'column', gap: '5px' },
    input: { padding: '10px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc' },
    submitBtn: { padding: '10px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' },
    footer: { marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }
};

export default PasswordResetRequest;