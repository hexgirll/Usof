const db = require('../config/db');

class NewsController {
    static async createNews(req, res) {
        try {
            const { title, content, is_pinned } = req.body;

            if (!title || !content) {
                return res.status(400).json({ message: 'Title and content are required' });
            }

            const [result] = await db.query(
                'INSERT INTO News (title, content, is_pinned, status, publish_date) VALUES (?, ?, ?, "active", NOW())',
                [title, content, is_pinned ? true : false]
            );

            res.status(201).json({ 
                message: 'News created successfully', 
                newsId: result.insertId 
            });
        } catch (error) {
            console.error('Failed to create news:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
    static async getAllNews(req, res) {
        try {
            const [news] = await db.query(
                'SELECT * FROM News ORDER BY is_pinned DESC, publish_date DESC'
            );
            res.json(news);
        } catch (error) {
            console.error('Failed to fetch news:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getNewsById(req, res) {
        try {
            const newsId = req.params.id;
            const userId = req.user ? req.user.id : null;

            const [items] = await db.query(`
                SELECT 
                    n.*,
                    (SELECT COUNT(*) FROM Likes WHERE news_id = n.id AND type = 'like') AS likes_count,
                    (SELECT COUNT(*) FROM Likes WHERE news_id = n.id AND type = 'dislike') AS dislikes_count,
                    COALESCE((
                        SELECT SUM(CASE WHEN type = 'like' THEN 1 WHEN type = 'dislike' THEN -1 ELSE 0 END)
                        FROM Likes WHERE news_id = n.id
                    ), 0) AS rating,
                    (SELECT type FROM Likes WHERE news_id = n.id AND author_id = ?) AS user_reaction
                FROM News n
                WHERE n.id = ?
            `, [userId, newsId]);

            const item = items[0];
            if (!item) {
                return res.status(404).json({ message: 'News item not found' });
            }

            res.json(item);
        } catch (error) {
            console.error('Failed to fetch news item:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updateNews(req, res) {
        try {
            const newsId = req.params.id;
            const { status, is_pinned, title, content } = req.body;

            const fields = [];
            const values = [];

            if (status !== undefined) { fields.push('status = ?'); values.push(status); }
            if (is_pinned !== undefined) { fields.push('is_pinned = ?'); values.push(is_pinned); }
            if (title !== undefined) { fields.push('title = ?'); values.push(title); }
            if (content !== undefined) { fields.push('content = ?'); values.push(content); }

            if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

            values.push(newsId);
            await db.query(`UPDATE News SET ${fields.join(', ')} WHERE id = ?`, values);

            res.json({ message: 'News updated successfully' });
        } catch (error) {
            console.error('Failed to update news:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async handleReaction(req, res) {
        try {
            const newsId = req.params.id;
            const authorId = req.user.id;
            const { type } = req.body;

            await db.query(`
                INSERT INTO Likes (type, news_id, author_id)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE type = VALUES(type)
            `, [type, newsId, authorId]);

            res.json({ message: 'Reaction saved' });
        } catch (error) {
            console.error('Failed to react to news:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async deleteReaction(req, res) {
        try {
            const newsId = req.params.id;
            const authorId = req.user.id;

            await db.query('DELETE FROM Likes WHERE news_id = ? AND author_id = ?', [newsId, authorId]);
            res.json({ message: 'Reaction removed' });
        } catch (error) {
            console.error('Failed to remove reaction:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getComments(req, res) {
        try {
            const newsId = req.params.id;
            const [comments] = await db.query(`
                SELECT c.id, c.content, c.publish_date, c.status, c.parent_id, c.author_id, u.login AS author,
                       (SELECT COUNT(*) FROM Likes WHERE comment_id = c.id AND type = 'like') AS likes_count,
                       (SELECT COUNT(*) FROM Likes WHERE comment_id = c.id AND type = 'dislike') AS dislikes_count,
                       (SELECT type FROM Likes WHERE comment_id = c.id AND author_id = ?) AS user_reaction,
                       IFNULL(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS rating
                FROM Comments c
                JOIN Users u ON c.author_id = u.id
                LEFT JOIN Likes l ON c.id = l.comment_id
                WHERE c.news_id = ?
                GROUP BY c.id, u.login
                ORDER BY rating DESC, c.publish_date ASC
            `, [req.user ? req.user.id : null, newsId]);

            res.json(comments);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async addComment(req, res) {
        try {
            const newsId = req.params.id;
            const authorId = req.user.id;
            const { content, parent_id } = req.body;

            await db.query(
                'INSERT INTO Comments (author_id, news_id, parent_id, content) VALUES (?, ?, ?, ?)',
                [authorId, newsId, parent_id || null, content]
            );

            res.status(201).json({ message: 'Comment added successfully' });
        } catch (error) {
            console.error('Failed to add comment:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async deleteNews(req, res) {
        try {
            const newsId = req.params.id;
            await db.query('DELETE FROM News WHERE id = ?', [newsId]);
            res.json({ message: 'News deleted successfully' });
        } catch (error) {
            console.error('Failed to delete news:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = NewsController;