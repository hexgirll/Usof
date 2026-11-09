const Like = require('../models/Like');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.addPostReaction = async (req, res) => {
    try {
        const { type } = req.body;
        const postId = req.params.postId;
        const authorId = req.user.id;

        if (!type || (type !== 'like' && type !== 'dislike')) {
            return res.status(400).json({ error: 'Reaction type is required (like or dislike)' });
        }

        const post = await Post.findById(postId, req.user);
        if (!post) {
            return res.status(404).json({ error: 'Post not found or inaccessible' });
        }
        if (post.status === 'inactive') {
            return res.status(403).json({ error: 'Cannot react to an inactive post' });
        }

        await Like.addPostReaction(type, postId, authorId);
        res.status(201).json({ message: 'Reaction added successfully' });
    } catch (error) {
        console.error('Create reaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPostLikes = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId, req.user || null);
        if (!post) {
            return res.status(404).json({ error: 'Post not found or inaccessible' });
        }

        const likes = await Like.getPostLikes(postId);
        res.status(200).json(likes);
    } catch (error) {
        console.error('Get post likes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deletePostReaction = async (req, res) => {
    try {
        const postId = req.params.postId;
        const authorId = req.user.id;

        const deleted = await Like.deletePostReaction ? await Like.deletePostReaction(postId, authorId) : true;

        const db = require('../config/db');
        await db.query('DELETE FROM Likes WHERE post_id = ? AND author_id = ?', [postId, authorId]);

        res.status(200).json({ message: 'Reaction removed successfully' });
    } catch (error) {
        console.error('Delete reaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.addCommentReaction = async (req, res) => {
    try {
        const { type } = req.body;
        const commentId = req.params.id;
        const authorId = req.user.id;

        if (!type || (type !== 'like' && type !== 'dislike')) {
            return res.status(400).json({ error: 'Reaction type is required (like or dislike)' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        if (comment.post_id) {
            const post = await Post.findById(comment.post_id, req.user);
            if (!post || post.status === 'inactive') {
                return res.status(403).json({ error: 'Cannot react to a comment on an inactive or inaccessible post' });
            }
        }

        await Like.addCommentReaction(type, commentId, authorId);
        res.status(201).json({ message: 'Reaction added successfully' });
    } catch (error) {
        console.error('Create comment reaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteCommentReaction = async (req, res) => {
    try {
        const commentId = req.params.id;
        const authorId = req.user.id; 

        const db = require('../config/db');
        await db.query('DELETE FROM Likes WHERE comment_id = ? AND author_id = ?', [commentId, authorId]);

        res.status(200).json({ message: 'Reaction deleted successfully' });
    } catch (error) {
        console.error('Delete comment reaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCommentLikes = async (req, res) => {
    try {
        const commentId = req.params.id;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const likes = await Like.getCommentLikes(commentId);
        res.status(200).json(likes);
    } catch (error) {
        console.error('Get comment likes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
