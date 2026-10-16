const express = require('express');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const categoryRoutes = require('./routes/category');
const setupAdminPanel = require('./admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to start the server asynchronously
const startServer = async () => {
    try {
        // 1. Initialize AdminJS BEFORE parsing JSON
        // (AdminJS uses its own parsers like express-formidable, placing it here prevents conflicts)
        await setupAdminPanel(app);

        // 2. Middleware to parse incoming JSON requests for our API
        app.use(express.json());

        // 3. Connect API routes
        app.use('/api/auth', authRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/posts', postRoutes);
        app.use('/api/comments', commentRoutes);
        app.use('/api/categories', categoryRoutes);

        // Basic route to test API
        app.get('/', (req, res) => {
            res.json({ message: 'GeoChill API is running!' });
        });

        // 4. Verify database connection
        await db.query('SELECT 1');
        console.log('Database connected successfully.');

        // 5. Start listening
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();