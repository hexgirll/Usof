const db = require('../config/db');

exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // Retrieve the user ID securely from the token
        const authorId = req.user.id; 

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const [result] = await db.query(
            'INSERT INTO Posts (author_id, title, content) VALUES (?, ?, ?)',
            [authorId, title, content]
        );

        res.status(201).json({ 
            message: 'Post created successfully', 
            postId: result.insertId 
        });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        // Fetch all posts and join with Users table to get the author's login
        // Order by the newest posts first
        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.publish_date, p.status, u.login AS author
            FROM Posts p
            JOIN Users u ON p.author_id = u.id
            ORDER BY p.publish_date DESC
        `);

        res.status(200).json(posts);

    } catch (error) {
        console.error('Get all posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        
        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.publish_date, p.status, u.login AS author
            FROM Posts p
            JOIN Users u ON p.author_id = u.id
            WHERE p.id = ?
        `, [postId]);

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json(posts[0]);

    } catch (error) {
        console.error('Get post by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const postId = req.params.id;
        const userId = req.user.id; 

        const [result] = await db.query(
            'UPDATE Posts SET title = ?, content = ? WHERE id = ? AND author_id = ?',
            [title, content, postId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json({ message: 'Post updated successfully' });

    } catch (error) {
        console.error('Update post by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id; 

        const [result] = await db.query(
            'DELETE FROM Posts WHERE id = ? AND author_id = ?',
            [postId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json({ message: 'Post deleted successfully' });

    } catch (error) {
        console.error('Delete post by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
