const db = require('../config/db');

class Comment {
    static async create(authorId, postId, parentId, content) {
        const [result] = await db.query(
            'INSERT INTO Comments (author_id, post_id, parent_id, content) VALUES (?, ?, ?, ?)',
            [authorId, postId, parentId || null, content]
        );
        return result.insertId;
    }

    static async findAllByPostId(postId, user) {
        const userIdForReaction = user ? user.id : null;
        let sql = `
            SELECT c.id, c.content, c.publish_date, c.status, c.parent_id, c.author_id, u.login AS author,
                   (SELECT COUNT(*) FROM Likes WHERE comment_id = c.id AND type = 'like') AS likes_count,
                   (SELECT COUNT(*) FROM Likes WHERE comment_id = c.id AND type = 'dislike') AS dislikes_count,
                   (SELECT type FROM Likes WHERE comment_id = c.id AND author_id = ?) AS user_reaction,
                   IFNULL(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS rating
            FROM Comments c
            JOIN Users u ON c.author_id = u.id
            LEFT JOIN Likes l ON c.id = l.comment_id
            WHERE c.post_id = ?
        `;
        let values = [userIdForReaction, postId];

        if (!user || user.role !== 'admin') {
            if (user && user.id) {
                sql += ' AND (c.status = "active" OR c.author_id = ?)';
                values.push(user.id);
            } else {
                sql += ' AND c.status = "active"';
            }
        }

        sql += ' GROUP BY c.id, u.login ORDER BY rating DESC, c.publish_date ASC';

        const [comments] = await db.query(sql, values);
        return comments;
    }

    static async findById(id, user = null) {
        const userIdForReaction = user ? user.id : null;
        const [comments] = await db.query(`
            SELECT c.id, c.content, c.publish_date, c.status, c.parent_id, c.author_id, c.post_id, u.login AS author,
                   (SELECT COUNT(*) FROM Likes WHERE comment_id = c.id AND type = 'like') AS likes_count,
                   (SELECT COUNT(*) FROM Likes WHERE comment_id = c.id AND type = 'dislike') AS dislikes_count,
                   (SELECT type FROM Likes WHERE comment_id = c.id AND author_id = ?) AS user_reaction
            FROM Comments c
            JOIN Users u ON c.author_id = u.id
            WHERE c.id = ?
        `, [userIdForReaction, id]);
        return comments[0];
    }

    static async updateStatus(id, status) {
        const [result] = await db.query(
            'UPDATE Comments SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM Comments WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Comment;