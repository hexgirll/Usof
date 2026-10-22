import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';

const PublicProfile = () => {
    const { id } = useParams();
    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [userRes, postsRes] = await Promise.all([
                    api.get(`/users/${id}`),
                    api.get(`/posts?author_id=${id}`)
                ]);

                setProfileUser(userRes.data);

                const postsData = Array.isArray(postsRes.data)
                    ? postsRes.data
                    : (Array.isArray(postsRes.data?.data) ? postsRes.data.data : (postsRes.data?.posts || []));

                setUserPosts(postsData);
            } catch (err) {
                setError('Failed to load user profile.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    if (loading) return <div>Loading profile...</div>;
    if (error || !profileUser) return <div style={{ color: 'red' }}>{error || 'User not found.'}</div>;

    const avatarUrl = profileUser.profile_picture && profileUser.profile_picture !== 'default_avatar.png'
        ? `http://localhost:5000/uploads/avatars/${profileUser.profile_picture}`
        : null;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={styles.headerBox}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={styles.avatar} />
                ) : (
                    <div style={styles.placeholder}>{profileUser.login?.charAt(0).toUpperCase()}</div>
                )}
                <div>
                    <h2>{profileUser.login}</h2>
                    <p style={{ color: '#666' }}>Full Name: {profileUser.full_name || 'N/A'}</p>
                    <p style={{ color: '#666' }}>Role: <strong>{profileUser.role}</strong> | Rating: <strong>{profileUser.rating}</strong></p>
                </div>
            </div>

            <hr style={{ margin: '30px 0' }} />

            <h3>Posts by {profileUser.login} ({Array.isArray(userPosts) ? userPosts.length : 0})</h3>

            {!Array.isArray(userPosts) || userPosts.length === 0 ? (
                <p>This user has not published any posts yet.</p>
            ) : (
                userPosts.map(post => <PostCard key={post.id} post={post} />)
            )}
        </div>
    );
};

const styles = {
    headerBox: { display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' },
    avatar: { width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover' },
    placeholder: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#3498db', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }
};

export default PublicProfile;