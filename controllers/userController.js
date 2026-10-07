const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.updateProfile = async (req, res) => {
    try {
        // Retrieve the user ID from the decoded JWT token (injected by middleware)
        const userId = parseInt(req.params.id);

        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to update this user' });
        }

        // Extract data from the request body
        const { full_name, email, role } = req.body;

        if (role && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can change roles' });
        }
        
        // Check if there is anything to update
        if (!full_name && !email && !role) {
            return res.status(400).json({ error: 'Please provide full_name, email, or role to update' });
        }

        // Dynamically build the SQL query based on provided fields
        const updateFields = [];
        const queryParams = [];

        if (full_name) {
            updateFields.push('full_name = ?');
            queryParams.push(full_name);
        }

        if (email) {
            updateFields.push('email = ?');
            queryParams.push(email);
        }

        if (role) {
            updateFields.push('role = ?');
            queryParams.push(role);
        }

        // Add the user ID for the WHERE clause at the end
        queryParams.push(userId);

        const queryString = `UPDATE Users SET ${updateFields.join(', ')} WHERE id = ?`;

        const [result] = await db.query(queryString, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully' });

    } catch (error) {
        // Handle potential MySQL errors, like duplicate emails
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email is already in use' });
        }
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.params.id;

        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.publish_date, p.status, u.login AS author
            FROM Posts p
            JOIN Users u ON p.author_id = u.id
            WHERE p.author_id = ?
            ORDER BY p.publish_date DESC
        `, [userId]);

        res.status(200).json(posts);

    } catch (error) {
        console.error('Get all user posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, login, full_name, email, profile_picture, rating, role 
            FROM Users
        `);
        res.status(200).json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const [users] = await db.query(`
            SELECT id, login, full_name, email, profile_picture, rating, role 
            FROM Users WHERE id = ?
        `, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(users[0]);
    } catch (error) {
        console.error('Get user by id error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filename = req.file.filename;

        const [users] = await db.query(`
            SELECT profile_picture FROM Users WHERE id = ?
        `, [req.user.id]);

        await db.query(`
            UPDATE Users SET profile_picture = ? WHERE id = ?
        `, [filename, req.user.id]);

        res.status(200).json({ message: 'Avatar uploaded successfully', filename, previousAvatar: users[0].profile_picture });
    } catch (error) {
        console.error('Get avatar error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this user' });
        }

        const [result] = await db.query(`
            DELETE FROM Users WHERE id = ?
        `, [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.newUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to create new users' });
        }

        const { login, password, password_confirmation, email, role } = req.body;

        if (!login || !password || !password_confirmation || !email || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== password_confirmation) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const [existingUsers] = await db.query(
            'SELECT * FROM Users WHERE login = ? OR email = ?',
            [login, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User with this login or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO Users (login, password, email, role, full_name) VALUES (?, ?, ?, ?, ?)',
            [login, hashedPassword, email, req.body.role, login]
        );

        res.status(201).json({ message: 'User created successfully', userId: result.insertId });

    } catch (error) {
        console.error('New user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};