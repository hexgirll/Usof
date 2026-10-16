const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.updateProfile = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to update this user' });
        }

        // Added login field for the presentation scenario requirement
        const { full_name, email, role, login } = req.body;

        if (role && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can change roles' });
        }
        
        if (!full_name && !email && !role && !login) {
            return res.status(400).json({ error: 'Please provide full_name, email, login, or role to update' });
        }

        const updateFields = [];
        const queryParams = [];

        if (full_name) { updateFields.push('full_name = ?'); queryParams.push(full_name); }
        if (email) { updateFields.push('email = ?'); queryParams.push(email); }
        if (role) { updateFields.push('role = ?'); queryParams.push(role); }
        if (login) { updateFields.push('login = ?'); queryParams.push(login); }

        const updated = await User.updateProfile(userId, updateFields, queryParams);

        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully' });

    } catch (error) {
        // Handle duplicate login or email errors smoothly
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email or login is already in use' });
        }
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const posts = await User.findPostsByUserId(userId);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Get user by ID error:', error);
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
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.updateAvatar(req.user.id, filename);

        res.status(200).json({ 
            message: 'Avatar uploaded successfully', 
            filename, 
            previousAvatar: user.profile_picture 
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this user' });
        }

        const deleted = await User.delete(userId);
        if (!deleted) {
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

        const existingUsers = await User.findByLoginOrEmail(login, email);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User with this login or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await User.create({
            login,
            password: hashedPassword,
            email,
            role,
            full_name: login
        });

        res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
        console.error('New user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};