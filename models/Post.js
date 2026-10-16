const db = require('../config/db');
const optionalAuth = require('../middleware/auth').optionalAuth;

class Post {
    static async create(authorId, title, content) {
        const [result] = await db.query(
            'INSERT INTO Posts (author_id, title, content) VALUES (?, ?, ?)',
            [authorId, title, content]
        );
        return result.insertId;
    }

    static async addCategories(postId, categories) {
        if (!categories || categories.length === 0) return;
        for (let categoryId of categories) {
            await db.query(
                'INSERT INTO Post_Category (post_id, category_id) VALUES (?, ?)',
                [postId, categoryId]
            );
        }
    }

    static async clearCategories(postId) {
        await db.query('DELETE FROM Post_Category WHERE post_id = ?', [postId]);
    }

    // Built-in filtering logic for active/inactive posts
    static async findAll(queryParams, user) {
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        const offset = (page - 1) * limit;
        const { sort, status, category, date_from, date_to } = queryParams;

        let sql = `
            SELECT p.*, 
                   IFNULL(SUM(CASE WHEN l.type = 'like' THEN 1 WHEN l.type = 'dislike' THEN -1 ELSE 0 END), 0) AS rating,
                   u.login AS author
            FROM Posts p
            LEFT JOIN Likes l ON p.id = l.post_id
            JOIN Users u ON p.author_id = u.id
        `;
        
        let conditions = [];
        let values = [];

        // Fix visibility bug: admin sees everything, user sees active + their own
        if (!user || user.role !== 'admin') {
            if (user && user.id) {
                conditions.push('(p.status = "active" OR p.author_id = ?)');
                values.push(user.id);
            } else {
                conditions.push('p.status = "active"');
            }
        }

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

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' GROUP BY p.id, u.login';

        if (sort === 'date') {
            sql += ' ORDER BY p.publish_date DESC';
        } else {
            sql += ' ORDER BY rating DESC';
        }

        sql += ' LIMIT ? OFFSET ?';
        values.push(limit, offset);

        const [posts] = await db.query(sql, values);
        return posts;
    }

    static async findById(id) {
        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.publish_date, p.status, p.author_id, u.login AS author
            FROM Posts p
            JOIN Users u ON p.author_id = u.id
            WHERE p.id = ?
        `, [id]);
        return posts[0];
    }

    static async update(id, updateFields, queryParams) {
        queryParams.push(id);
        const queryString = `UPDATE Posts SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await db.query(queryString, queryParams);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM Posts WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getCategories(postId) {
        const [categories] = await db.query(`
            SELECT c.id, c.title, c.description 
            FROM Categories c
            JOIN Post_Category pc ON c.id = pc.category_id
            WHERE pc.post_id = ?
        `, [postId]);
        return categories;
    }
}

module.exports = Post;