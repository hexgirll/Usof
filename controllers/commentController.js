const db = require('../config/db');

exports.createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;
        const authorId = req.user.id;

        if (!content) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        const [result] = await db.query(`
            INSERT INTO Comments (content, post_id, author_id)
            VALUES (?, ?, ?)
        `, [content, postId, authorId]);

        res.status(201).json({ message: 'Comment created successfully' });

    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPostComments = async (req, res) => {
    try {
        const postId = req.params.postId;

        const [result] = await db.query(`
            SELECT c.id, c.content, c.publish_date, c.status, u.login AS author
            FROM Comments c
            JOIN Users u ON c.author_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.publish_date ASC
        `, [postId]);

        res.status(200).json(result);

    } catch (error) {
        console.error('Get post comments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const commentId = req.params.id;
        const authorId = req.user.id; 

        const [result] = await db.query(
            'UPDATE Comments SET content = ? WHERE id = ? AND author_id = ?',
            [content, commentId, authorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }

        res.status(200).json({ message: 'Comment updated successfully' });

    } catch (error) {
        console.error('Update comment by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const authorId = req.user.id; 

        const [result] = await db.query(
            'DELETE FROM Comments WHERE id = ? AND author_id = ?',
            [commentId, authorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }

        res.status(200).json({ message: 'Comment deleted successfully' });

    } catch (error) {
        console.error('Delete comment by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};