import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../redux/authSlice';
import api from '../services/api';
import PostCard from '../components/PostCard';

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({ login: '', full_name: '', email: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [imgError, setImgError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Пагінація та пости
    const [userPosts, setUserPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        if (user) {
            setFormData({ login: user.login || '', full_name: user.full_name || '', email: user.email || '' });
        }
    }, [user]);

    const fetchUserPosts = useCallback(async () => {
        if (!user) return;
        setLoadingPosts(true);
        try {
            const response = await api.get(`/posts?author_id=${user.id}&page=${page}&limit=10`);
            // Точна структура від оновленого бекенду
            setUserPosts(response.data.data || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
            setTotalItems(response.data.pagination?.totalItems || 0);
        } catch (error) {
            console.error('Failed to load user posts:', error);
            setUserPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    }, [user, page]);

    useEffect(() => {
        fetchUserPosts();
    }, [fetchUserPosts]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            await api.patch(`/users/${user.id}`, formData);
            if (avatarFile) {
                const uploadData = new FormData();
                uploadData.append('avatar', avatarFile);
                await api.patch('/users/avatar', uploadData);
            }
            const updatedUserRes = await api.get(`/users/${user.id}`);
            dispatch(setUser(updatedUserRes.data));
            setAvatarFile(null);
            setPreviewUrl(null);
            setStatus({ type: 'success', message: 'Profile saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to save profile changes.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePostUpdate = (updatedPost) => {
        setUserPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            fetchUserPosts(); // Перезавантажити список для правильної пагінації
        } catch (err) {
            console.error('Failed to delete post:', err);
        }
    };

    if (!user) return <div>Please log in to view your profile.</div>;

    const displayAvatarUrl = previewUrl || (
        user.profile_picture && user.profile_picture !== 'default_avatar.png'
            ? `http://localhost:5000/uploads/avatars/${user.profile_picture}`
            : null
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>User Profile</h2>

            {status.message && (
                <div style={{ padding: '10px', marginBottom: '15px', color: status.type === 'error' ? 'red' : 'green', border: `1px solid ${status.type === 'error' ? 'red' : 'green'}` }}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSaveProfile}>
                <div style={styles.profileSection}>
                    <div style={styles.avatarBox}>
                        {displayAvatarUrl && !imgError ? (
                            <img src={displayAvatarUrl} alt="Avatar" style={styles.avatarImage} onError={() => setImgError(true)} />
                        ) : (
                            <div style={styles.avatarPlaceholder}>{user.login?.charAt(0).toUpperCase()}</div>
                        )}
                        <label style={styles.uploadLabel}>
                            Choose Avatar
                            <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                        </label>
                    </div>

                    <div style={styles.infoForm}>
                        <label>Username:</label>
                        <input type="text" name="login" value={formData.login} onChange={handleChange} required style={styles.input} />
                        
                        <label>Full Name:</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} style={styles.input} />
                        
                        <label>Email:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={styles.input} />

                        <div style={styles.readOnlyMeta}>
                            <span>Role: <strong>{user.role}</strong></span>
                            <span>Rating: <strong>{user.rating}</strong></span>
                        </div>

                        <button type="submit" disabled={isSaving} style={styles.saveBtn}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>

            <hr style={{ margin: '30px 0' }} />

            {/* Коректний лічильник завдяки totalItems від бекенду */}
            <h3>My Posts ({totalItems})</h3>

            {loadingPosts ? (
                <div>Loading your posts...</div>
            ) : userPosts.length === 0 ? (
                <p>You haven't created any posts yet.</p>
            ) : (
                <div className="user-posts-list">
                    {userPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onPostUpdate={handlePostUpdate}
                            onDelete={handleDeletePost}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

const styles = {
    profileSection: { display: 'flex', gap: '30px', alignItems: 'flex-start', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' },
    avatarBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '180px' },
    avatarImage: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' },
    avatarPlaceholder: { width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#3498db', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5em' },
    uploadLabel: { marginTop: '12px', padding: '6px 12px', backgroundColor: '#3498db', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', textAlign: 'center' },
    infoForm: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    readOnlyMeta: { display: 'flex', gap: '20px', fontSize: '0.9em', color: '#555', marginTop: '5px' },
    saveBtn: { padding: '10px 15px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '10px' },
    pagination: { display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }
};

export default Profile;