const db = require('../config/db');

class Category {
    static async create(title, description) {
        const [result] = await db.query(
            'INSERT INTO Categories (title, description) VALUES (?, ?)',
            [title, description]
        );
        return result.insertId;
    }

    static async findAll() {
        const [categories] = await db.query('SELECT * FROM Categories');
        return categories;
    }

    static async findById(id) {
        const [categories] = await db.query('SELECT * FROM Categories WHERE id = ?', [id]);
        return categories[0];
    }

    static async update(id, title, description) {
        const [result] = await db.query(
            'UPDATE Categories SET title = IFNULL(?, title), description = IFNULL(?, description) WHERE id = ?',
            [title, description, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM Categories WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async findPosts(id) {
        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.publish_date, p.status, u.login AS author
            FROM Posts p
            JOIN Post_Category pc ON p.id = pc.post_id
            JOIN Users u ON p.author_id = u.id
            WHERE pc.category_id = ?
        `, [id]);
        return posts;
    }
}

module.exports = Category;