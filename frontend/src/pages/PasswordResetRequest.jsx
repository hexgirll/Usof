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
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h2 style={styles.title}>Reset Password</h2>
                <p style={styles.description}>
                    Enter your email address below and we will send you a secure link to reset your password.
                </p>

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
    field: { display: 'flex', flexDirection: 'column' },
    input: { padding: '14px 16px', fontSize: '1em', borderRadius: '8px', border: '1px solid #ccd1d9', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', width: '100%' },
    submitBtn: { width: '100%', padding: '14px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontSize: '1.05em', fontWeight: 'bold', transition: 'opacity 0.2s' },
    footer: { marginTop: '25px', textAlign: 'center' },
    link: { color: '#7f8c8d', textDecoration: 'none', fontSize: '0.95em', fontWeight: '600', transition: 'color 0.2s' }
};

export default PasswordResetRequest;