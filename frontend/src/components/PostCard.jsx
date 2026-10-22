import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';

const PostCard = ({ post, onPostUpdate, onDelete }) => {
    const { user } = useSelector((state) => state.auth);
    const isOwnerOrAdmin = user && (user.role === 'admin' || user.id === post.author_id);
    
    // Local state just for immediate UI feedback on status toggle
    const [localStatus, setLocalStatus] = useState(post.status);

    useEffect(() => {
        setLocalStatus(post.status);
    }, [post.status]);

    const handleToggleStatus = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const newStatus = localStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/posts/${post.id}`, { status: newStatus });
            setLocalStatus(newStatus); // Instant UI update
            
            if (onPostUpdate) {
                onPostUpdate({ ...post, status: newStatus });
            }
        } catch (err) {
            console.error('Failed to update post status:', err);
            alert(err.response?.data?.error || 'Failed to update post status.');
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <Link to={`/posts/${post.id}`} style={styles.titleLink}>
                    <h3 style={styles.title}>{post.title}</h3>
                </Link>

                {isOwnerOrAdmin && (
                    <div style={styles.adminControls}>
                        <span style={{
                            ...styles.statusBadge,
                            backgroundColor: localStatus === 'active' ? '#2ecc71' : '#e67e22'
                        }}>
                            {localStatus?.toUpperCase()}
                        </span>

                        <button onClick={handleToggleStatus} style={styles.toggleBtn}>
                            Mark as {localStatus === 'active' ? 'Inactive' : 'Active'}
                        </button>

                        <Link to={`/posts/${post.id}/edit`} style={styles.editBtn}>
                            Edit
                        </Link>
                        
                        {onDelete && (
                            <button onClick={(e) => { e.preventDefault(); onDelete(post.id); }} style={styles.deleteBtn}>
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>

            <p style={styles.contentPreview}>
                {post.content?.length > 150 
                    ? `${post.content.substring(0, 150)}...` 
                    : post.content}
            </p>

            <div style={styles.meta}>
                <span>
                    Author: {' '}
                    <Link to={`/users/${post.author_id}`} style={styles.authorLink}>
                        <strong>{post.author || 'Unknown'}</strong>
                    </Link>
                </span>
                <span>Rating: <strong>{post.rating ?? 0}</strong></span>
                <span>Date: {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>
    );
};

const styles = {
    card: { border: '1px solid #e0e0e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' },
    titleLink: { textDecoration: 'none', color: '#2c3e50' },
    title: { margin: 0, fontSize: '1.2em' },
    adminControls: { display: 'flex', alignItems: 'center', gap: '8px' },
    statusBadge: { padding: '3px 8px', color: '#fff', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' },
    toggleBtn: { padding: '4px 8px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' },
    editBtn: { padding: '4px 8px', backgroundColor: '#3498db', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '0.8em' },
    deleteBtn: { padding: '4px 8px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' },
    contentPreview: { color: '#555', lineHeight: '1.4', marginBottom: '12px' },
    meta: { display: 'flex', gap: '20px', fontSize: '0.85em', color: '#7f8c8d' },
    authorLink: { color: '#3498db', textDecoration: 'none' }
};

export default PostCard;