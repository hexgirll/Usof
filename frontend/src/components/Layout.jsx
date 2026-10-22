import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            
            {/* The Outlet component acts as a placeholder for nested routes */}
            <main style={{ flex: 1, padding: '20px' }}>
                <Outlet />
            </main>

            <footer style={{ backgroundColor: '#ecf0f1', padding: '10px', textAlign: 'center' }}>
                <p>&copy; 2026 GeoChill Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;