const db = require('../config/db');

exports.addPostReaction = async (req, res) => {
    try {
        const { type } = req.body;
        const postId = req.params.postId;
        const authorId = req.user.id;

        if (!type || (type !== 'like' && type !== 'dislike')) {
            return res.status(400).json({ error: 'Reaction type is required' });
        }

        const [result] = await db.query(`
            INSERT INTO Likes (type, post_id, author_id)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE type = VALUES(type)
        `, [type, postId, authorId]);

        res.status(201).json({ message: 'Reaction added successfully' });

    } catch (error) {
        console.error('Create reaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPostLikes = async (req, res) => {
    try {
        const postId = req.params.postId;

        const [result] = await db.query(`
            SELECT l.type, u.login AS author
            FROM Likes l
            JOIN Users u ON l.author_id = u.id
            WHERE l.post_id = ?
        `, [postId]);

        res.status(200).json(result);

    } catch (error) {
        console.error('Get post likes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deletePostReaction = async (req, res) => {
    try {
        const postId = req.params.postId;
        const authorId = req.user.id; 

        const [result] = await db.query(
            'DELETE FROM Likes WHERE post_id = ? AND author_id = ?',
            [postId, authorId]
        );

        res.status(200).json({ message: 'Reaction deleted successfully' });

    } catch (error) {
        console.error('Delete post reaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};