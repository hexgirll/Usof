const db = require('../config/db');

class Comment {
    static async create(authorId, postId, parentId, content) {
        // If parentId is not provided, NULL will be written (standard comment)
        const [result] = await db.query(
            'INSERT INTO Comments (author_id, post_id, parent_id, content) VALUES (?, ?, ?, ?)',
            [authorId, postId, parentId || null, content]
        );
        return result.insertId;
    }

    static async findAllByPostId(postId) {
        const [comments] = await db.query(`
            SELECT c.id, c.content, c.publish_date, c.status, c.parent_id, c.author_id, u.login AS author
            FROM Comments c
            JOIN Users u ON c.author_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.publish_date ASC
        `, [postId]);
        return comments;
    }

    static async findById(id) {
        const [comments] = await db.query(`
            SELECT c.id, c.content, c.publish_date, c.status, c.parent_id, c.author_id, c.post_id, u.login AS author
            FROM Comments c
            JOIN Users u ON c.author_id = u.id
            WHERE c.id = ?
        `, [id]);
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