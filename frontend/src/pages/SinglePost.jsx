import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import CommentItem from '../components/CommentItem';
import styles from './SinglePost.module.css';
import { useNavigate } from 'react-router-dom';

const SinglePost = () => {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [categories, setCategories] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [avatarFailed, setAvatarFailed] = useState(false);

    const nextImage = () => {
        if (post?.images) {
            setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
        }
    };

    const prevImage = () => {
        if (post?.images) {
            setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
        }
    };

    const isOwnerOrAdmin = user && (user.role === 'admin' || user.id === post?.author_id);
    const isInactive = post?.status === 'inactive';

    const fetchPostData = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
            }

            const postRes = await api.get(`/posts/${id}`);
            setPost(postRes.data);

            const [catRes, commRes] = await Promise.allSettled([
                api.get(`/posts/${id}/categories`),
                api.get(`/posts/${id}/comments`)
            ]);

            if (catRes.status === 'fulfilled') setCategories(catRes.value.data);
            if (commRes.status === 'fulfilled') setComments(commRes.value.data);

        } catch (err) {
            setError('Failed to load post data.');
            console.error('Fetch post error:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPostData(true);
    }, [fetchPostData]);

    const handleToggleStatus = async () => {
        const newStatus = post.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/posts/${post.id}`, { status: newStatus });
            setPost({ ...post, status: newStatus });
        } catch (err) {
            console.error('Failed to update post status:', err);
            alert('Failed to update post status.');
        }
    };

    const handlePostReaction = async (type) => {
        try {
            const previousReaction = post.user_reaction;
            let newReaction = previousReaction === type ? null : type;
            let newLikesCount = Number(post.likes_count) || 0;
            let newDislikesCount = Number(post.dislikes_count) || 0;

            if (previousReaction === type) {
                if (type === 'like') newLikesCount--;
                if (type === 'dislike') newDislikesCount--;
            } else {
                if (type === 'like') {
                    newLikesCount++;
                    if (previousReaction === 'dislike') newDislikesCount--;
                } else {
                    newDislikesCount++;
                    if (previousReaction === 'like') newLikesCount--;
                }
            }

            const newRating = newLikesCount - newDislikesCount;

            setPost(prev => ({
                ...prev,
                user_reaction: newReaction,
                likes_count: newLikesCount,
                dislikes_count: newDislikesCount,
                rating: newRating
            }));

            if (previousReaction === type) {
                await api.delete(`/posts/${id}/like`);
            } else {
                await api.post(`/posts/${id}/like`, { type });
            }
        } catch (err) {
            console.error('Failed to react to post:', err);
            fetchPostData();
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await api.post(`/posts/${id}/comments`, { content: newComment });
            setNewComment('');
            fetchPostData();
        } catch (err) {
            console.error('Failed to add comment:', err);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/posts/${id}`);
            navigate('/');
        } catch (err) {
            console.error('Failed to delete post:', err);
            alert('Failed to delete post.');
        }
    };

    if (loading) return <div>Loading post details...</div>;
    if (error || !post) return <div style={{ color: 'red' }}>{error || 'Post not found'}</div>;

    const rootComments = comments.filter(c => c.parent_id === null);
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
        <div 
            className={styles.container} 
            style={{ 
                opacity: isInactive ? 0.8 : 1, 
                backgroundColor: isInactive ? '#f8f9fa' : '#fff'
            }}
        >
            {isInactive && (
                <div style={{ backgroundColor: '#fef5e7', color: '#d35400', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #f5c6cb', fontWeight: 'bold', fontSize: '0.9em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>This post is currently inactive</span>
                    {isOwnerOrAdmin && (
                        <button onClick={handleToggleStatus} className={`${styles.btn} ${styles.toggleBtn}`} style={{ backgroundColor: '#2ecc71', height: '32px' }}>
                            Make Active
                        </button>
                    )}
                </div>
            )}

            <h1 style={{ marginBottom: '10px', color: isInactive ? '#7f8c8d' : '#2c3e50' }}>{post.title}</h1>
            
            <div className={styles.metaRow} style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <Link to={`/users/${post.author_id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                    {post.author_avatar && post.author_avatar !== 'default_avatar.png' && !avatarFailed ? (
                        <img 
                            src={getAvatarUrl(post.author_avatar)} 
                            alt={post.author} 
                            style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '1.5px solid #3498db'
                            }} 
                            onError={() => setAvatarFailed(true)} 
                        />
                    ) : (
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#3498db',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            textTransform: 'uppercase'
                        }}>
                            {post.author ? post.author[0] : 'U'}
                        </div>
                    )}
                    <strong style={{ fontSize: '1.05em', color: '#2c3e50' }}>{post.author}</strong>
                </Link>

                <span>Date: {new Date(post.publish_date).toLocaleString()}</span>
                <span>Rating: <strong>{post.rating ?? 0}</strong></span>
            </div>

            <div className={styles.controlsRow}>
                <div className={styles.categoriesGroup}>
                    <span className={styles.categoriesLabel}>Categories:</span>
                    <div className={styles.categories}>
                        {categories.length > 0 ? (
                            categories.map(cat => (
                                <span key={cat.id} className={styles.categoryBadge}>{cat.title}</span>
                            ))
                        ) : (
                            <span style={{ color: '#888', fontSize: '0.9em' }}>None</span>
                        )}
                    </div>
                </div>

                {isOwnerOrAdmin && (
                    <div className={styles.adminControls}>
                        <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: post.status === 'active' ? '#2ecc71' : '#e67e22' }}
                        >
                            {post.status?.toUpperCase()}
                        </span>
                        
                        <button onClick={handleToggleStatus} className={`${styles.btn} ${styles.toggleBtn}`}>
                            Make {post.status === 'active' ? 'Inactive' : 'Active'}
                        </button>
                        
                        <Link to={`/posts/${post.id}/edit`} className={`${styles.btn} ${styles.editBtn}`}>
                            Edit Post
                        </Link>

                        <button onClick={handleDeletePost} className={`${styles.btn} ${styles.deleteBtn}`}>
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {post.images && post.images.length > 0 && (
                <div style={{ position: 'relative', marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '450px', filter: isInactive ? 'grayscale(30%)' : 'none' }}>
                    <img 
                        src={getImageUrl(post.images[currentImageIndex])} 
                        alt={`Slide ${currentImageIndex + 1}`} 
                        className={styles.sliderImage}
                    />

                    {post.images.length > 1 && (
                        <>
                            <button 
                                onClick={prevImage} 
                                style={{ position: 'absolute', left: '15px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                ❮
                            </button>
                            <button 
                                onClick={nextImage} 
                                style={{ position: 'absolute', right: '15px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                ❯
                            </button>
                            <div style={{ position: 'absolute', bottom: '15px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85em' }}>
                                {currentImageIndex + 1} / {post.images.length}
                            </div>
                        </>
                    )}
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />

            <div className={styles.content} style={{ color: isInactive ? '#555' : '#2c3e50' }}>{post.content}</div>

            <div className={styles.reactions} style={{ display: 'flex', gap: '15px', marginTop: '20px', alignItems: 'center' }}>
                <button 
                    onClick={() => handlePostReaction('like')} 
                    disabled={isInactive}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '8px 14px', 
                        cursor: isInactive ? 'not-allowed' : 'pointer', 
                        backgroundColor: post?.user_reaction === 'like' ? '#ffebee' : '#f8f9fa', 
                        color: post?.user_reaction === 'like' ? '#e74c3c' : '#555', 
                        border: '1px solid',
                        borderColor: post?.user_reaction === 'like' ? '#e74c3c' : '#ddd',
                        borderRadius: '20px',
                        fontWeight: '600',
                        opacity: isInactive ? 0.5 : 1,
                        transition: 'all 0.2s'
                    }}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={post?.user_reaction === 'like' ? '#e74c3c' : 'currentColor'}>
                        <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.42 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.42 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                    </svg>
                    <span>{post?.likes_count || 0}</span>
                </button>

                <button 
                    onClick={() => handlePostReaction('dislike')} 
                    disabled={isInactive}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '8px 14px', 
                        cursor: isInactive ? 'not-allowed' : 'pointer', 
                        backgroundColor: post?.user_reaction === 'dislike' ? '#eceff1' : '#f8f9fa', 
                        color: post?.user_reaction === 'dislike' ? '#2c3e50' : '#555', 
                        border: '1px solid',
                        borderColor: post?.user_reaction === 'dislike' ? '#2c3e50' : '#ddd',
                        borderRadius: '20px',
                        fontWeight: '600',
                        opacity: isInactive ? 0.5 : 1,
                        transition: 'all 0.2s'
                    }}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={post?.user_reaction === 'dislike' ? '#2c3e50' : 'currentColor'}>
                        <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.28C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.7 8.79,20L12,17V3Z" />
                    </svg>
                    <span>{post?.dislikes_count || 0}</span>
                </button>
            </div>

            <hr style={{ margin: '30px 0' }} />

            <h3>Comments ({comments.length})</h3>
            {user ? (
                <form onSubmit={handleAddComment} className={styles.commentForm}>
                    <textarea
                        rows="3"
                        placeholder={isInactive ? "Comments are disabled on inactive posts" : "Leave a comment..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        disabled={isInactive}
                        className={styles.textarea}
                    />
                    <button type="submit" disabled={isInactive} className={styles.submitCommentBtn} style={{ opacity: isInactive ? 0.5 : 1 }}>
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
                            onCommentUpdated={fetchPostData}
                            currentUser={user} 
                            isNews={false}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SinglePost;