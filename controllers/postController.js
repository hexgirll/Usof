const db = require('../config/db');

exports.createPost = async (req, res) => {
    try {
        const { title, content, categories } = req.body;
        
        // Retrieve the user ID securely from the token
        const authorId = req.user.id; 

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const [result] = await db.query(
            'INSERT INTO Posts (author_id, title, content) VALUES (?, ?, ?)',
            [authorId, title, content]
        );

        const postId = result.insertId;

        if (categories && categories.length > 0) {
            for (let categoryId of categories) {
                await db.query(
                    'INSERT INTO Post_Category (post_id, category_id) VALUES (?, ?)',
                    [postId, categoryId]
                );
            }
        }

        res.status(201).json({ 
            message: 'Post created successfully', 
            postId
        });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        // Extract all possible parameters from the URL
        const { sort, status, category, date_from, date_to } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Start building the SQL query
        let sql = `
            SELECT p.*, 
                   IFNULL(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS rating
            FROM Posts p
            LEFT JOIN Likes l ON p.id = l.post_id
        `;
        
        let conditions = []; // Array for WHERE conditions
        let values = [];     // Array for parameterized query values

        // Add conditions based on the provided parameters
        if (category) {
            sql += ' JOIN Post_Category pc ON p.id = pc.post_id';
            conditions.push('pc.category_id = ?');
            values.push(category);
        }

        if (status) {
            conditions.push('p.status = ?');
            values.push(status);
        }

        if (date_from && date_to) {
            conditions.push('p.publish_date BETWEEN ? AND ?');
            values.push(date_from, date_to);
        }

        // If there are any conditions, append them to the SQL query
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        // Group by post ID to ensure correct aggregation of likes/dislikes
        sql += ' GROUP BY p.id';

        if (sort === 'date') {
            sql += ' ORDER BY p.publish_date DESC';
        } else {
            sql += ' ORDER BY rating DESC';
        }

        sql += ' LIMIT ? OFFSET ?';
        values.push(limit, offset);

        // Execute the query and return the results
        const [posts] = await db.query(sql, values);
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
        const { title, content, categories } = req.body;
        const postId = req.params.id;
        const userId = req.user.id; 

        const [result] = await db.query(
            'UPDATE Posts SET title = IFNULL(?, title), content = IFNULL(?, content) WHERE id = ? AND author_id = ?',
            [title, content, postId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Post not found or unauthorized' });
        }

        if (categories && Array.isArray(categories)) {
            // First, delete all existing categories for this post
            await db.query('DELETE FROM Post_Category WHERE post_id = ?', [postId]);

            // Then add new ones (if the array is not empty)
            if (categories.length > 0) {
                for (let categoryId of categories) {
                    await db.query(
                        'INSERT INTO Post_Category (post_id, category_id) VALUES (?, ?)',
                        [postId, categoryId]
                    );
                }
            }
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


exports.getPostCategories = async (req, res) => {
    try {
        const postId = req.params.postId;

        const [result] = await db.query(`
            SELECT c.id, c.title, c.description 
            FROM Categories c
            JOIN Post_Category pc ON c.id = pc.category_id
            WHERE pc.post_id = ?
        `, [postId]);

        res.status(200).json(result);

    } catch (error) {
        console.error('Get post categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};