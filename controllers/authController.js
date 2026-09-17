const bcrypt = require('bcrypt');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

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

exports.login = async (req, res) => {
    try {
        // The user can log in with either their login or email, 
        // so we'll accept 'login' in the request body to represent either
        const { login, password } = req.body;

        // Check if both fields are provided
        if (!login || !password) {
            return res.status(400).json({ error: 'Login and password are required' });
        }

        // Find the user by login or email
        const [users] = await db.query(
            'SELECT * FROM Users WHERE login = ? OR email = ?',
            [login, login]
        );

        const user = users[0];

        // If user not found, return generic error for security (don't reveal if login exists)
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token containing the user's ID and role
        // It will expire in 24 hours
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send the token back to the client
        res.status(200).json({ 
            message: 'Login successful', 
            token 
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};