import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import CommentItem from '../components/CommentItem';

const SinglePost = () => {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [post, setPost] = useState(null);
    const [categories, setCategories] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Перевірка прав для відображення кнопок керування
    const isOwnerOrAdmin = user && (user.role === 'admin' || user.id === post?.author_id);

    // Fetch all details for this post
    const fetchPostData = useCallback(async () => {
        try {
            const [postRes, catRes, commRes] = await Promise.all([
                api.get(`/posts/${id}`),
                api.get(`/posts/${id}/categories`),
                api.get(`/posts/${id}/comments`)
            ]);

            setPost(postRes.data);
            setCategories(catRes.data);
            setComments(commRes.data);
        } catch (err) {
            setError('Failed to load post data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPostData();
    }, [fetchPostData]);

    // Швидка зміна статусу поста для власника або адміна
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

    // Handle post like / dislike reactions
    const handlePostReaction = async (type) => {
        try {
            await api.post(`/posts/${id}/like`, { type });
            fetchPostData();
        } catch (err) {
            console.error('Failed to react to post:', err);
        }
    };

    // Handle submitting a top-level comment
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

    if (loading) return <div>Loading post details...</div>;
    if (error || !post) return <div style={{ color: 'red' }}>{error || 'Post not found'}</div>;

    // Filter root comments (comments without parent_id)
    const rootComments = comments.filter(c => c.parent_id === null);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h1 style={{ marginBottom: '10px' }}>{post.title}</h1>
            
            <div style={styles.metaRow}>
                <span>Author: <Link to={`/users/${post.author_id}`} style={styles.link}><strong>{post.author}</strong></Link></span>
                <span>Date: {new Date(post.publish_date).toLocaleString()}</span>
                <span>Rating: <strong>{post.rating ?? 0}</strong></span>
            </div>

            {/* Згрупований блок категорій та кнопок керування (Admin/Owner) */}
            <div style={styles.controlsRow}>
                <div style={styles.categoriesGroup}>
                    <span style={styles.categoriesLabel}>Categories:</span>
                    <div style={styles.categories}>
                        {categories.length > 0 ? (
                            categories.map(cat => (
                                <span key={cat.id} style={styles.categoryBadge}>{cat.title}</span>
                            ))
                        ) : (
                            <span style={{ color: '#888', fontSize: '0.9em' }}>None</span>
                        )}
                    </div>
                </div>

                {isOwnerOrAdmin && (
                    <div style={styles.adminControls}>
                        <span style={{
                            ...styles.statusBadge,
                            backgroundColor: post.status === 'active' ? '#2ecc71' : '#e67e22'
                        }}>
                            {post.status?.toUpperCase()}
                        </span>
                        
                        <button onClick={handleToggleStatus} style={styles.toggleBtn}>
                            Make {post.status === 'active' ? 'Inactive' : 'Active'}
                        </button>
                        
                        <Link to={`/posts/${post.id}/edit`} style={styles.editBtn}>
                            Edit Post
                        </Link>
                    </div>
                )}
            </div>

            <hr style={{ margin: '20px 0' }} />

            {/* Post Content */}
            <div style={styles.content}>{post.content}</div>

            {/* Post Reactions */}
            <div style={styles.reactions}>
                <button onClick={() => handlePostReaction('like')} style={styles.reactionBtn}>Like</button>
                <button onClick={() => handlePostReaction('dislike')} style={styles.reactionBtn}>Dislike</button>
            </div>

            <hr style={{ margin: '30px 0' }} />

            {/* Add Top-Level Comment */}
            <h3>Comments ({comments.length})</h3>
            {user ? (
                <form onSubmit={handleAddComment} style={styles.commentForm}>
                    <textarea
                        rows="3"
                        placeholder="Leave a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        style={styles.textarea}
                    />
                    <button type="submit" style={styles.submitCommentBtn}>Submit Comment</button>
                </form>
            ) : (
                <p><em>Please login to leave a comment.</em></p>
            )}

            {/* Comments List (Tree Structure) */}
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
                            currentUserId={user?.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    metaRow: { display: 'flex', gap: '20px', color: '#666', fontSize: '0.9em', marginBottom: '20px' },
    link: { color: '#3498db', textDecoration: 'none' },
    controlsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', padding: '12px 15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee' },
    categoriesGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    categoriesLabel: { fontWeight: 'bold', color: '#555', fontSize: '0.9em' },
    categories: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    categoryBadge: { backgroundColor: '#34495e', color: '#fff', padding: '4px 10px', borderRadius: '15px', fontSize: '0.85em' },
    adminControls: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
    statusBadge: { padding: '5px 10px', color: '#fff', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' },
    toggleBtn: { padding: '6px 12px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' },
    editBtn: { padding: '6px 12px', backgroundColor: '#3498db', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' },
    content: { fontSize: '1.1em', lineHeight: '1.6', color: '#2c3e50', whiteSpace: 'pre-wrap' },
    reactions: { display: 'flex', gap: '10px', marginTop: '20px' },
    reactionBtn: { padding: '8px 15px', cursor: 'pointer', backgroundColor: '#ecf0f1', border: '1px solid #bdc3c7', borderRadius: '4px' },
    commentForm: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
    textarea: { padding: '10px', width: '100%', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' },
    submitCommentBtn: { padding: '8px 16px', alignSelf: 'flex-start', cursor: 'pointer', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }
};

export default SinglePost;