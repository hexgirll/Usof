import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import styles from './Layout.module.css';

const Layout = () => {
    return (
        <div className={styles.appContainer}>
            <Header />
            
            <main className={styles.mainContent}>
                <Outlet />
            </main>

            <footer className={styles.footer}>
                <p>&copy; 2026 GeoChill Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;