const db = require('../config/db');

class User {
    static async findById(id) {
        const [users] = await db.query('SELECT id, login, full_name, email, profile_picture, rating, role, is_verified FROM Users WHERE id = ?', [id]);
        return users[0];
    }

    static async findByLoginOrEmail(login, email) {
        const [users] = await db.query('SELECT * FROM Users WHERE login = ? OR email = ?', [login, email]);
        return users;
    }

    // New method for strict login verification (AND condition)
    static async findByLoginAndEmail(login, email) {
        const [users] = await db.query('SELECT * FROM Users WHERE login = ? AND email = ?', [login, email]);
        return users[0];
    }

    static async findByEmail(email) {
        const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        return users[0];
    }

    static async create(userData) {
        const { login, password, email, role, full_name } = userData;
        const [result] = await db.query(
            'INSERT INTO Users (login, password, email, role, full_name) VALUES (?, ?, ?, ?, ?)',
            [login, password, email, role || 'user', full_name]
        );
        return result.insertId;
    }

    static async verifyEmail(email) {
        const [result] = await db.query('UPDATE Users SET is_verified = true WHERE email = ?', [email]);
        return result.affectedRows > 0;
    }

    static async updatePassword(id, hashedPassword) {
        const [result] = await db.query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, id]);
        return result.affectedRows > 0;
    }

    static async updateProfile(id, updateFields, queryParams) {
        queryParams.push(id);
        const queryString = `UPDATE Users SET ${updateFields.join(', ')} WHERE id = ?`;
        const [result] = await db.query(queryString, queryParams);
        return result.affectedRows > 0;
    }

    static async findAll() {
        const [users] = await db.query('SELECT id, login, full_name, email, profile_picture, rating, role FROM Users');
        return users;
    }

    static async findPostsByUserId(userId, requester = null) {
        const isOwnerOrAdmin = requester && (requester.id === parseInt(userId) || requester.role === 'admin');
        
        let query = `
            SELECT 
                p.id, 
                p.title, 
                p.content, 
                p.publish_date, 
                p.status, 
                u.login AS author,
                COALESCE((
                    SELECT SUM(CASE WHEN type = 'like' THEN 1 WHEN type = 'dislike' THEN -1 ELSE 0 END)
                    FROM Likes
                    WHERE post_id = p.id
                ), 0) AS rating
            FROM Posts p
            JOIN Users u ON p.author_id = u.id
            WHERE p.author_id = ?
        `;
        const queryParams = [userId];

        if (!isOwnerOrAdmin) {
            query += ` AND p.status = 'active'`;
        }

        query += ` ORDER BY p.publish_date DESC`;

        const [posts] = await db.query(query, queryParams);
        return posts;
    }

    static async updateAvatar(id, filename) {
        const [result] = await db.query('UPDATE Users SET profile_picture = ? WHERE id = ?', [filename, id]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM Users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = User;