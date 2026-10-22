const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const ensureDatabaseInitialized = require('./db-init');

const app = express();
const PORT = process.env.PORT || 5000;

// Function to start the server asynchronously
const startServer = async () => {
    try {
        // 1. Automatically check and initialize the database if missing
        await ensureDatabaseInitialized();

        // 2. Load models, db connection pool & AdminJS after DB exists
        const db = require('./config/db');
        const setupAdminPanel = require('./admin');
        const authRoutes = require('./routes/auth');
        const userRoutes = require('./routes/user');
        const postRoutes = require('./routes/post');
        const commentRoutes = require('./routes/comment');
        const categoryRoutes = require('./routes/category');

        // 3. Initialize AdminJS BEFORE parsing JSON
        await setupAdminPanel(app);

        // CORS middleware to allow requests from the frontend
        app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
        app.use(express.json());

        // Serve static files from the uploads directory
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

        // Connect API routes
        app.use('/api/auth', authRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/posts', postRoutes);
        app.use('/api/comments', commentRoutes);
        app.use('/api/categories', categoryRoutes);

        // Basic route to test API
        app.get('/', (req, res) => {
            res.json({ message: 'GeoChill API is running!' });
        });

        // Verify database connection pool
        await db.query('SELECT 1');
        console.log('Database connected successfully.');

        // Start listening
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();