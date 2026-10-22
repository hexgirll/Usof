const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Import our new OOP Model

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.register = async (req, res) => {
    try {
        const { login, password, password_confirmation, email } = req.body;

        if (!login || !password || !password_confirmation || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== password_confirmation) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Check for duplicates using OR (either login or email is taken)
        const existingUsers = await User.findByLoginOrEmail(login, email);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User with this login or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserId = await User.create({
            login,
            password: hashedPassword,
            email,
            role: 'user',
            full_name: login 
        });

        const verificationToken = jwt.sign(
            { email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const confirmUrl = `${frontendUrl}/confirm-email?token=${verificationToken}`;

        await transporter.sendMail({
            to: email,
            subject: "GeoChill - Confirm your email",
            html: `<p>Click the link to confirm your email: <a href="${confirmUrl}">${confirmUrl}</a></p>`
        });

        res.status(201).json({ message: 'User registered successfully, confirmation email sent', userId: newUserId });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { login, email, password } = req.body;

        if (!login || !email || !password) {
            return res.status(400).json({ error: 'All fields (login, email, password) are required' });
        }

        // Use the new strict AND method
        const user = await User.findByLoginAndEmail(login, email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please confirm your email address' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ message: 'Login successful', token });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.confirmEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        await User.verifyEmail(decoded.email);
        
        res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

exports.passwordResetRequest = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            // Return 200 even if user not found to prevent email enumeration attacks
            return res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/password-reset?token=${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'GeoChill - Password Reset',
            text: `To reset your password, please click the link below.\n\n${resetLink}\n\nThis link will expire in 15 minutes.`
        });

        // Removed resetLink from JSON response to fix security leak
        res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.passwordReset = async (req, res) => {
    try {
        const token = req.params.token;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updated = await User.updatePassword(decoded.id, hashedPassword);

        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Logout route is now implemented
exports.logout = (req, res) => {
    // In JWT, logout is handled client-side by deleting the token.
    // We just return a success message here.
    res.status(200).json({ message: 'Logged out successfully' });
};