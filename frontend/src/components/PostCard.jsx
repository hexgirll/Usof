import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import styles from './PostCard.module.css';

const PostCard = ({ post, onPostUpdate, onDelete }) => {
    const { user } = useSelector((state) => state.auth);
    const isOwnerOrAdmin = user && (user.role === 'admin' || user.id === post.author_id);
    
    const [localStatus, setLocalStatus] = useState(post.status);
    const [avatarFailed, setAvatarFailed] = useState(false); 

    useEffect(() => {
        setLocalStatus(post.status);
    }, [post.status]);

    const handleToggleStatus = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const newStatus = localStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/posts/${post.id}`, { status: newStatus });
            setLocalStatus(newStatus); 
            
            if (onPostUpdate) {
                onPostUpdate({ ...post, status: newStatus });
            }
        } catch (err) {
            console.error('Failed to update post status:', err);
            alert(err.response?.data?.error || 'Failed to update post status.');
        }
    };

    const getImageUrl = (filename) => `http://localhost:5000/uploads/${filename}`;

    const getAvatarUrl = (filename) => {
        if (!filename) return '';
        if (filename.startsWith('http')) return filename;
        
        let cleanPath = filename.replace(/\\/g, '/');
        
        if (cleanPath.startsWith('uploads/avatars/')) {
            cleanPath = cleanPath.replace('uploads/avatars/', '');
        } else if (cleanPath.startsWith('avatars/')) {
            cleanPath = cleanPath.replace('avatars/', '');
        } else if (cleanPath.startsWith('uploads/')) {
            cleanPath = cleanPath.replace('uploads/', '');
        }

        return `http://localhost:5000/uploads/avatars/${cleanPath}`;
    };

    return (
        <div className={styles.card} style={{ 
            opacity: localStatus === 'inactive' ? 0.75 : 1, 
            backgroundColor: localStatus === 'inactive' ? '#f8f9fa' : '#fff',
            transition: 'all 0.2s ease-in-out'
        }}>
            {localStatus === 'inactive' && (
                <div style={{ backgroundColor: '#fef5e7', color: '#d35400', padding: '6px 12px', borderRadius: '4px', marginBottom: '10px', fontSize: '0.85em', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Inactive Post</span>
                </div>
            )}

            <div className={styles.header}>
                <Link to={`/posts/${post.id}`} className={styles.titleLink}>
                    <h3 className={styles.title}>{post.title}</h3>
                </Link>

                {isOwnerOrAdmin && (
                    <div className={styles.adminControls}>
                        <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: localStatus === 'active' ? '#2ecc71' : '#e67e22' }}
                        >
                            {localStatus}
                        </span>

                        <button onClick={handleToggleStatus} className={`${styles.btn} ${styles.toggleBtn}`}>
                            Make {localStatus === 'active' ? 'Inactive' : 'Active'}
                        </button>

                        <Link to={`/posts/${post.id}/edit`} className={`${styles.btn} ${styles.editBtn}`}>
                            Edit
                        </Link>
                        
                        {onDelete && (
                            <button 
                                onClick={(e) => { e.preventDefault(); onDelete(post.id); }} 
                                className={`${styles.btn} ${styles.deleteBtn}`}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <Link to={`/users/${post.author_id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                    {post.author_avatar && post.author_avatar !== 'default_avatar.png' && !avatarFailed ? (
                        <img 
                            src={getAvatarUrl(post.author_avatar)} 
                            alt={post.author} 
                            style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '1px solid #ddd'
                            }} 
                            onError={() => setAvatarFailed(true)} 
                        />
                    ) : (
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#3498db',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            textTransform: 'uppercase'
                        }}>
                            {post.author ? post.author[0] : 'U'}
                        </div>
                    )}
                    <span style={{ fontWeight: '600', color: '#2c3e50', fontSize: '0.95em' }}>{post.author || 'Unknown User'}</span>
                </Link>
            </div>

            {post.images && post.images.length > 0 && (
                <div className={styles.mediaContainer}>
                    {post.images.length === 1 ? (
                        <img src={getImageUrl(post.images[0])} alt="Post media" className={styles.singleImage} />
                    ) : post.images.length === 2 ? (
                        <div className={`${styles.imageGrid} ${styles.gridTwo}`}>
                            <img src={getImageUrl(post.images[0])} alt="Media 1" className={styles.gridMain} />
                            <img src={getImageUrl(post.images[1])} alt="Media 2" className={styles.gridMain} />
                        </div>
                    ) : (
                        <div className={`${styles.imageGrid} ${styles.gridMulti}`}>
                            <img src={getImageUrl(post.images[0])} alt="Main post media" className={styles.gridMain} />
                            <div className={styles.gridSide}>
                                {post.images[1] && <img src={getImageUrl(post.images[1])} alt="Thumb 1" className={styles.gridThumb} />}
                                {post.images[2] && <img src={getImageUrl(post.images[2])} alt="Thumb 2" className={styles.gridThumb} />}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <p className={styles.contentPreview}>
                {post.content?.length > 150 
                    ? `${post.content.substring(0, 150)}...` 
                    : post.content}
            </p>

            <div className={styles.meta} style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '15px', color: '#7f8c8d' }}>
                <span>Rating: <strong style={{ color: '#2c3e50' }}>{post.rating ?? 0}</strong></span>
                <span>•</span>
                <span>Date: {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>
    );
};

export default PostCard;