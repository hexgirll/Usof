const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.createComment = async (req, res) => {
    try {
        const { content, parent_id } = req.body;
        const postId = req.params.postId;
        const authorId = req.user.id;

        if (!content) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if the post exists and is accessible
        const post = await Post.findById(postId, req.user);
        if (!post) {
            return res.status(404).json({ error: 'Post not found or inaccessible' });
        }
        if (post.status === 'inactive') {
            return res.status(403).json({ error: 'Cannot comment on an inactive post' });
        }

        // Validate the parent comment, if this is a nested comment
        if (parent_id) {
            const parentComment = await Comment.findById(parent_id);
            if (!parentComment || parentComment.post_id != postId) {
                return res.status(400).json({ error: 'Invalid parent comment' });
            }
        }

        await Comment.create(authorId, postId, parent_id, content);
        res.status(201).json({ message: 'Comment created successfully' });

    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCommentById = async (req, res) => {
    try {
        const commentId = req.params.id;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        console.error('Get comment by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        // 1. Check if post exists and requester has rights to view it
        const post = await Post.findById(postId, req.user);
        if (!post) {
            return res.status(404).json({ error: 'Post not found or inaccessible' });
        }

        // 2. Fetch comments using the correct method name 'findAllByPostId'
        const comments = await Comment.findAllByPostId(postId, req.user);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Get post comments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { status, content } = req.body;

        if (content) {
            return res.status(403).json({ error: 'Comment content cannot be edited, only status' });
        }
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const commentId = req.params.id;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only admin or the author of the comment can update its status
        if (req.user.role !== 'admin' && req.user.id !== comment.author_id) {
            return res.status(403).json({ error: 'Unauthorized to update this comment' });
        }

        await Comment.updateStatus(commentId, status);
        res.status(200).json({ message: 'Comment status updated successfully' });

    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only admin or the author of the comment can delete it
        if (req.user.role !== 'admin' && req.user.id !== comment.author_id) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        await Comment.delete(commentId);
        res.status(200).json({ message: 'Comment deleted successfully' });

    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};