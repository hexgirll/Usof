import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import styles from './Header.module.css';

const Header = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [searchParams] = useSearchParams();
    const currentSearch = searchParams.get('search') || '';
    
    const [inputValue, setInputValue] = useState(currentSearch);

    useEffect(() => {
        setInputValue(currentSearch);
    }, [currentSearch]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const executeSearch = () => {
        if (inputValue.trim()) {
            navigate(`/?search=${encodeURIComponent(inputValue.trim())}`);
        } else {
            navigate('/');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeSearch();
        }
    };

    const handleClearSearch = () => {
        setInputValue('');
        navigate('/');
    };

    const avatarUrl = user?.profile_picture && user.profile_picture !== 'default_avatar.png'
        ? `http://localhost:5000/uploads/avatars/${user.profile_picture}`
        : null;

    return (
        <header className={styles.header}>
            <div className="logo">
                <Link to="/" className={styles.logoLink}><h2>GeoChill</h2></Link>
            </div>

            <div className={styles.searchContainer}>
                <input 
                    type="text" 
                    placeholder="Search spots, tips, and trails..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={styles.searchInput} 
                />
                
                <svg className={styles.searchIcon} viewBox="0 0 24 24" onClick={executeSearch}>
                    <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
                
                {inputValue && (
                    <svg className={styles.clearIcon} viewBox="0 0 24 24" onClick={handleClearSearch}>
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                )}
            </div>

            <div className={styles.userMenu}>
                {isAuthenticated ? (
                    <>
                        <Link to="/posts/create" className={styles.createBtn}>+ Create Post</Link>
                        <Link to="/profile" className={styles.userInfo}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {user?.login?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            {user?.login || 'User'} ({user?.role || 'user'})
                        </Link>
                        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={styles.navLink}>Login</Link>
                        <Link to="/register" className={styles.navLink}>Register</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;