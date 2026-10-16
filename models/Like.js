const db = require('../config/db');

class Like {
    static async addPostReaction(type, postId, authorId) {
        const [result] = await db.query(`
            INSERT INTO Likes (type, post_id, author_id)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE type = VALUES(type)
        `, [type, postId, authorId]);
        return result;
    }

    static async getPostLikes(postId) {
        const [likes] = await db.query(`
            SELECT l.type, u.login AS author
            FROM Likes l
            JOIN Users u ON l.author_id = u.id
            WHERE l.post_id = ?
        `, [postId]);
        return likes;
    }

    static async deletePostReaction(postId, authorId) {
        const [result] = await db.query(
            'DELETE FROM Likes WHERE post_id = ? AND author_id = ?',
            [postId, authorId]
        );
        return result.affectedRows > 0;
    }

    static async addCommentReaction(type, commentId, authorId) {
        const [result] = await db.query(`
            INSERT INTO Likes (type, comment_id, author_id)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE type = VALUES(type)
        `, [type, commentId, authorId]);
        return result;
    }

    static async getCommentLikes(commentId) {
        const [likes] = await db.query(`
            SELECT l.type, u.login AS author
            FROM Likes l
            JOIN Users u ON l.author_id = u.id
            WHERE l.comment_id = ?
        `, [commentId]);
        return likes;
    }

    static async deleteCommentReaction(commentId, authorId) {
        const [result] = await db.query(
            'DELETE FROM Likes WHERE comment_id = ? AND author_id = ?',
            [commentId, authorId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Like;