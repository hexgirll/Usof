import React, { useState } from 'react';
import api from '../services/api';

const CommentItem = ({ comment, allComments, postId, onCommentUpdated, currentUserId }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Find direct child comments (replies) where parent_id matches this comment's id
    const childComments = allComments.filter(c => c.parent_id === comment.id);

    // Handle like or dislike reaction on comment
    const handleReaction = async (type) => {
        try {
            await api.post(`/comments/${comment.id}/like`, { type });
            onCommentUpdated();
        } catch (error) {
            console.error('Failed to react to comment:', error);
        }
    };

    // Handle posting a reply to this comment
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post(`/posts/${postId}/comments`, {
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

    return (
        <div style={styles.commentBox}>
            <div style={styles.commentHeader}>
                <strong>{comment.author}</strong>
                <span style={styles.date}>{new Date(comment.publish_date).toLocaleString()}</span>
            </div>

            <p style={styles.content}>{comment.content}</p>

            <div style={styles.actions}>
                <span style={styles.rating}>Rating: {comment.rating}</span>
                <button onClick={() => handleReaction('like')} style={styles.btn}>Like</button>
                <button onClick={() => handleReaction('dislike')} style={styles.btn}>Dislike</button>
                {currentUserId && (
                    <button onClick={() => setShowReplyBox(!showReplyBox)} style={styles.btn}>
                        {showReplyBox ? 'Cancel' : 'Reply'}
                    </button>
                )}
            </div>

            {/* Reply Input Form */}
            {showReplyBox && (
                <form onSubmit={handleSendReply} style={styles.replyForm}>
                    <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        required
                        style={styles.replyInput}
                    />
                    <button type="submit" disabled={isSubmitting} style={styles.btn}>
                        Send
                    </button>
                </form>
            )}

            {/* Recursive rendering for nested child comments */}
            {childComments.length > 0 && (
                <div style={styles.nestedContainer}>
                    {childComments.map(child => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            allComments={allComments}
                            postId={postId}
                            onCommentUpdated={onCommentUpdated}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    commentBox: { borderLeft: '3px solid #3498db', paddingLeft: '12px', marginTop: '12px', backgroundColor: '#fafafa', padding: '10px', borderRadius: '4px' },
    commentHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', color: '#555' },
    date: { color: '#888' },
    content: { margin: '8px 0', color: '#2c3e50' },
    actions: { display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.85em' },
    rating: { fontWeight: 'bold' },
    btn: { padding: '3px 8px', cursor: 'pointer', fontSize: '0.8em' },
    replyForm: { marginTop: '8px', display: 'flex', gap: '8px' },
    replyInput: { flex: 1, padding: '5px' },
    nestedContainer: { marginLeft: '15px', marginTop: '10px' }
};

export default CommentItem;