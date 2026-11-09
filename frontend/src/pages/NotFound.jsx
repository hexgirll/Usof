import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '8rem', fontWeight: '700', color: 'var(--primary-color)', lineHeight: '1' }}>
                404
            </div>
            <h2 style={{ fontSize: '2rem', margin: '20px 0', color: 'var(--text-dark)' }}>Looks like you're lost!</h2>
            <p style={{ marginBottom: '40px', color: 'var(--text-light)', fontSize: '1.1em', lineHeight: '1.6' }}>
                The page you are looking for has evaporated into the digital ether. 
                It might have been moved, deleted, or perhaps it never existed in the first place.
            </p>
            <Link to="/" style={{ 
                padding: '12px 28px', 
                backgroundColor: 'var(--primary-color)', 
                color: '#fff', 
                textDecoration: 'none', 
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1.1em',
                boxShadow: '0 4px 6px rgba(52, 152, 219, 0.3)'
            }}>
                Take Me Home
            </Link>
        </div>
    );
};

export default NotFound;