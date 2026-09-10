const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { login, password, password_confirmation, email } = req.body;

        // Validate that all required fields are present
        if (!login || !password || !password_confirmation || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate password confirmation
        if (password !== password_confirmation) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Check if a user with this login or email already exists
        const [existingUsers] = await db.query(
            'SELECT * FROM Users WHERE login = ? OR email = ?',
            [login, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User with this login or email already exists' });
        }

        // Hash the password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // We pass the 'login' value as a temporary 'full_name' 
        // since the database requires this field to not be empty.
        const [result] = await db.query(
            'INSERT INTO Users (login, password, email, role, full_name) VALUES (?, ?, ?, ?, ?)',
            [login, hashedPassword, email, 'user', login]
        );

        // Return a success response with the new user's ID
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};