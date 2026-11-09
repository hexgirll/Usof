import React, { useState } from 'react';
import api from '../services/api';
import styles from './CommentItem.module.css';

const CommentItem = ({ comment, allComments, postId, onCommentUpdated, currentUser, isNews = false }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const childComments = allComments.filter(c => c.parent_id === comment.id);
    const isOwnerOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.id === comment.author_id);

    const handleReaction = async (type, e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            if (comment.user_reaction === type) {
                await api.delete(`/comments/${comment.id}/like`);
            } else {
                await api.post(`/comments/${comment.id}/like`, { type });
            }
            if (onCommentUpdated) onCommentUpdated();
        } catch (error) {
            console.error('Failed to react to comment:', error);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        try {
            const endpoint = isNews ? `/news/${postId}/comments` : `/posts/${postId}/comments`;
            
            await api.post(endpoint, {
                content: replyContent,
                parent_id: comment.id
            });
            setReplyContent('');
            setShowReplyBox(false);
            onCommentUpdated();
        } catch (error) {
            console.error('Failed to post reply:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/comments/${comment.id}`);
            onCommentUpdated();
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const handleToggleStatus = async () => {
        const newStatus = comment.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/comments/${comment.id}`, { status: newStatus });
            onCommentUpdated();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <div className={styles.commentBox}>
            <div className={styles.commentHeader}>
                <strong>{comment.author}</strong>
                <span className={styles.date}>{new Date(comment.publish_date).toLocaleString()}</span>
            </div>

            <p className={styles.content}>
                {comment.status === 'inactive' ? <em>[This comment is inactive]</em> : comment.content}
            </p>

            <div className={styles.actions}>
                <span className={styles.rating}>Rating: {comment.rating}</span>
                
                <button 
                    type="button"
                    onClick={(e) => handleReaction('like', e)} 
                    className={styles.btn} 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: comment.user_reaction === 'like' ? '#ffebee' : 'transparent', color: comment.user_reaction === 'like' ? '#e74c3c' : 'inherit' }}
                >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill={comment.user_reaction === 'like' ? '#e74c3c' : 'currentColor'}>
                        <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.42 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.42 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                    </svg>
                </button>

                <button 
                    type="button"
                    onClick={(e) => handleReaction('dislike', e)} 
                    className={styles.btn} 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: comment.user_reaction === 'dislike' ? '#eceff1' : 'transparent', color: comment.user_reaction === 'dislike' ? '#2c3e50' : 'inherit' }}
                >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill={comment.user_reaction === 'dislike' ? '#2c3e50' : 'currentColor'}>
                        <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.28C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.7 8.79,20L12,17V3Z" />
                    </svg>
                </button>
                
                {currentUser && (
                    <button type="button" onClick={() => setShowReplyBox(!showReplyBox)} className={styles.btn}>
                        {showReplyBox ? 'Cancel' : 'Reply'}
                    </button>
                )}

                {isOwnerOrAdmin && (
                    <>
                        <button type="button" onClick={handleToggleStatus} className={styles.warningBtn}>
                            {comment.status === 'active' ? 'Hide' : 'Unhide'}
                        </button>
                        <button type="button" onClick={handleDelete} className={styles.dangerBtn}>Delete</button>
                    </>
                )}
            </div>

            {showReplyBox && (
                <form onSubmit={handleSendReply} className={styles.replyForm}>
                    <textarea
                        rows="3"
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        required
                        className={styles.replyInput} 
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button type="submit" disabled={isSubmitting} className={styles.btn} style={{ backgroundColor: '#2ecc71' }}>
                            Send Reply
                        </button>
                    </div>
                </form>
            )}

            {childComments.length > 0 && (
                <div className={styles.nestedContainer}>
                    {childComments.map(child => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            allComments={allComments}
                            postId={postId}
                            onCommentUpdated={onCommentUpdated}
                            currentUser={currentUser}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;