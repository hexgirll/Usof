import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import CommentItem from '../components/CommentItem';
import styles from './SinglePost.module.css';
import { useNavigate } from 'react-router-dom';

const SingleNews = () => {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [newsItem, setNewsItem] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const isAdmin = user && user.role === 'admin';

    const fetchNewsData = useCallback(async () => {
        try {
            const [newsRes, commRes] = await Promise.all([
                api.get(`/news/${id}`),
                api.get(`/news/${id}/comments`)
            ]);

            setNewsItem(newsRes.data);
            setComments(commRes.data);
        } catch (err) {
            setError('Failed to load news details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchNewsData();
    }, [fetchNewsData]);

    const handleToggleStatus = async () => {
        const newStatus = newsItem.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/news/${newsItem.id}`, { status: newStatus });
            setNewsItem({ ...newsItem, status: newStatus });
        } catch (err) {
            console.error('Failed to update news status:', err);
            alert('Failed to update news status.');
        }
    };

    const handleTogglePin = async () => {
        const newPinState = !newsItem.is_pinned;
        try {
            await api.patch(`/news/${newsItem.id}`, { is_pinned: newPinState });
            setNewsItem({ ...newsItem, is_pinned: newPinState });
        } catch (err) {
            console.error('Failed to update pin status:', err);
            alert('Failed to update pin status.');
        }
    };

    const handleNewsReaction = async (type) => {
        try {
            if (newsItem.user_reaction === type) {
                await api.delete(`/news/${id}/like`);
            } else {
                await api.post(`/news/${id}/like`, { type });
            }
            fetchNewsData();
        } catch (err) {
            console.error('Failed to react to news:', err);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await api.post(`/news/${id}/comments`, { content: newComment });
            setNewComment('');
            fetchNewsData();
        } catch (err) {
            console.error('Failed to add comment:', err);
        }
    };

    const handleDeleteNews = async () => {
        if (!window.confirm('Are you sure you want to delete this news item?')) return;
        try {
            await api.delete(`/news/${id}`);
            navigate('/');
        } catch (err) {
            console.error('Failed to delete news:', err);
            alert('Failed to delete news.');
        }
    };

    if (loading) return <div>Loading announcement details...</div>;
    if (error || !newsItem) return <div style={{ color: 'red' }}>{error || 'News not found'}</div>;

    const rootComments = comments.filter(c => c.parent_id === null);

    return (
        <div className={styles.container} style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h1 style={{ marginBottom: '10px' }}>
                {newsItem.is_pinned ? '📌 ' : ''}{newsItem.title}
            </h1>
            
            <div className={styles.metaRow} style={{ display: 'flex', gap: '20px', color: '#666', fontSize: '0.9em', marginBottom: '20px' }}>
                <span>Official Announcement</span>
                <span>Date: {new Date(newsItem.publish_date).toLocaleString()}</span>
                <span>Rating: <strong>{newsItem.rating ?? 0}</strong></span>
            </div>

            {isAdmin && (
                <div className={styles.controlsRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span 
                            className={styles.statusBadge}
                            style={{ padding: '5px 10px', color: '#fff', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold', backgroundColor: newsItem.status === 'active' ? '#2ecc71' : '#e67e22' }}
                        >
                            {newsItem.status?.toUpperCase()}
                        </span>
                        
                        <span 
                            style={{ padding: '5px 10px', color: '#fff', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold', backgroundColor: newsItem.is_pinned ? '#9b59b6' : '#95a5a6' }}
                        >
                            {newsItem.is_pinned ? 'PINNED' : 'UNPINNED'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleTogglePin} className={styles.btn} style={{ backgroundColor: '#9b59b6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {newsItem.is_pinned ? 'Unpin News' : 'Pin News'}
                        </button>

                        <button onClick={handleToggleStatus} className={styles.btn} style={{ backgroundColor: '#f39c12', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Make {newsItem.status === 'active' ? 'Inactive' : 'Active'}
                        </button>

                        <button onClick={handleDeleteNews} className={styles.btn} style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Delete
                        </button>
                    </div>
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />

            <div className={styles.content} style={{ fontSize: '1.1em', lineHeight: '1.6', color: '#2c3e50', whiteSpace: 'pre-wrap' }}>
                {newsItem.content}
            </div>

            <div className={styles.reactions} style={{ display: 'flex', gap: '15px', marginTop: '20px', alignItems: 'center' }}>
                <button 
                    onClick={() => handleNewsReaction('like')} 
                    disabled={newsItem?.status === 'inactive'}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '8px 14px', 
                        cursor: newsItem?.status === 'inactive' ? 'not-allowed' : 'pointer', 
                        backgroundColor: newsItem?.user_reaction === 'like' ? '#ffebee' : '#f8f9fa', 
                        color: newsItem?.user_reaction === 'like' ? '#e74c3c' : '#555', 
                        border: '1px solid',
                        borderColor: newsItem?.user_reaction === 'like' ? '#e74c3c' : '#ddd',
                        borderRadius: '20px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        userSelect: 'none'
                    }}
                    title="Click to like or remove"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={newsItem?.user_reaction === 'like' ? '#e74c3c' : 'currentColor'}>
                        <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.42 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.42 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                    </svg>
                    <span>{newsItem?.likes_count || 0}</span>
                </button>

                <button 
                    onClick={() => handleNewsReaction('dislike')} 
                    disabled={newsItem?.status === 'inactive'}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '8px 14px', 
                        cursor: newsItem?.status === 'inactive' ? 'not-allowed' : 'pointer', 
                        backgroundColor: newsItem?.user_reaction === 'dislike' ? '#eceff1' : '#f8f9fa', 
                        color: newsItem?.user_reaction === 'dislike' ? '#2c3e50' : '#555', 
                        border: '1px solid',
                        borderColor: newsItem?.user_reaction === 'dislike' ? '#2c3e50' : '#ddd',
                        borderRadius: '20px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        userSelect: 'none'
                    }}
                    title="Click to dislike or remove"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={newsItem?.user_reaction === 'dislike' ? '#2c3e50' : 'currentColor'}>
                        <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.28C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.7 8.79,20L12,17V3Z" />
                    </svg>
                    <span>{newsItem?.dislikes_count || 0}</span>
                </button>
            </div>

            <hr style={{ margin: '30px 0' }} />

            <h3>Comments ({comments.length})</h3>
            {user ? (
                <form onSubmit={handleAddComment} className={styles.commentForm} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                    <textarea
                        rows="3"
                        placeholder="Leave a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        className={styles.textarea}
                        style={{ padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
                    />
                    <button type="submit" className={styles.submitCommentBtn} style={{ padding: '8px 16px', alignSelf: 'flex-start', cursor: 'pointer', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        Submit Comment
                    </button>
                </form>
            ) : (
                <p><em>Please login to leave a comment.</em></p>
            )}

            <div style={{ marginTop: '20px' }}>
                {rootComments.length === 0 ? (
                    <p>No comments yet. Be the first to comment!</p>
                ) : (
                    rootComments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            allComments={comments}
                            postId={id}
                            onCommentUpdated={fetchNewsData}
                            currentUser={user}
                            isNews={true}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SingleNews;