import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

const Header = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Redirect to Home page with search query parameter
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/');
        }
    };

    const avatarUrl = user?.profile_picture && user.profile_picture !== 'default_avatar.png'
        ? `http://localhost:5000/uploads/avatars/${user.profile_picture}`
        : null;

    return (
        <header style={styles.header}>
            <div className="logo">
                <Link to="/" style={styles.link}><h2>GeoChill</h2></Link>
            </div>

            {/* Header Search Form */}
            <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
                <input 
                    type="text" 
                    placeholder="Search posts..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput} 
                />
                <button type="submit" style={styles.searchBtn}>Search</button>
            </form>

            <div className="user-menu" style={styles.userMenu}>
                {isAuthenticated ? (
                    <>
                        <Link to="/posts/create" style={styles.createBtn}>+ Create Post</Link>
                        <Link to="/profile" style={{ textDecoration: 'none', color: 'white' }}>
                            <span style={styles.userInfo}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" style={styles.avatarImage} />
                                ) : (
                                    <div style={styles.avatarPlaceholder}>
                                        {user?.login?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                {user?.login || 'User'} ({user?.role || 'user'})
                            </span>
                        </Link>
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.navLink}>Login</Link>
                        <Link to="/register" style={styles.navLink}>Register</Link>
                    </>
                )}
            </div>
        </header>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', alignItems: 'center' },
    link: { color: 'white', textDecoration: 'none' },
    searchForm: { display: 'flex', gap: '5px' },
    searchInput: { padding: '6px 12px', borderRadius: '4px', border: 'none', outline: 'none' },
    searchBtn: { padding: '6px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#3498db', color: 'white', cursor: 'pointer' },
    userMenu: { display: 'flex', alignItems: 'center', gap: '15px' },
    createBtn: { backgroundColor: '#3498db', color: '#fff', textDecoration: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.9em' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    avatarImage: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' },
    avatarPlaceholder: { width: '32px', height: '32px', backgroundColor: '#3498db', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
    navLink: { color: 'white', textDecoration: 'none' },
    logoutBtn: { padding: '5px 10px', cursor: 'pointer' }
};

export default Header;