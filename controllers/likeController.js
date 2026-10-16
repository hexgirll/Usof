const Like = require('../models/Like');

exports.addPostReaction = async (req, res) => {
    try {
        const { type } = req.body;
        const postId = req.params.postId;
        const authorId = req.user.id;

        if (!type || (type !== 'like' && type !== 'dislike')) {
            return res.status(400).json({ error: 'Reaction type is required (like or dislike)' });
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

        await Like.deletePostReaction(postId, authorId);
        res.status(200).json({ message: 'Reaction deleted successfully' });
    } catch (error) {
        console.error('Delete post reaction error:', error);
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

        await Like.addCommentReaction(type, commentId, authorId);
        res.status(201).json({ message: 'Reaction added successfully' });
    } catch (error) {
        console.error('Create reaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCommentLikes = async (req, res) => {
    try {
        const commentId = req.params.id;
        const likes = await Like.getCommentLikes(commentId);
        res.status(200).json(likes);
    } catch (error) {
        console.error('Get comment likes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteCommentReaction = async (req, res) => {
    try {
        const commentId = req.params.id;
        const authorId = req.user.id; 

        await Like.deleteCommentReaction(commentId, authorId);
        res.status(200).json({ message: 'Reaction deleted successfully' });
    } catch (error) {
        console.error('Delete comment reaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};