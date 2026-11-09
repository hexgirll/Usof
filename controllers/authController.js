const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (pwd) => pwd && pwd.length >= 6;

exports.register = async (req, res) => {
    try {
        const { login, password, password_confirmation, email } = req.body;

        if (!login || !password || !password_confirmation || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        if (password !== password_confirmation) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

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
            from: process.env.EMAIL_USER,
            to: email,
            subject: "GeoChill - Confirm your email",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Welcome to GeoChill! 🌍</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
                        We're excited to have you on board. Please confirm your email address by clicking the button below to complete your registration.
                    </p>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${confirmUrl}" style="background-color: #2ecc71; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Confirm Email Address
                        </a>
                    </div>
                    <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${confirmUrl}" style="color: #3498db; word-break: break-all;">${confirmUrl}</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
                    <p style="color: #95a5a6; font-size: 12px; text-align: center;">
                        If you didn't create an account with GeoChill, please ignore this email.
                    </p>
                </div>
            `
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

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

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

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: 'A valid email is required' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/password-reset?token=${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'GeoChill - Password Reset Request',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Reset Your Password 🔒</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
                        We received a request to reset the password for your GeoChill account. Click the button below to choose a new password.
                    </p>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetLink}" style="background-color: #3498db; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${resetLink}" style="color: #3498db; word-break: break-all;">${resetLink}</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
                    <p style="color: #95a5a6; font-size: 12px; text-align: center;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                </div>
            `
        });

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

        if (!isValidPassword(password)) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
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

exports.logout = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};