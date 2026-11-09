const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const ensureDatabaseInitialized = require('./db-init');

const app = express();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await ensureDatabaseInitialized();

        const db = require('./config/db');
        const setupAdminPanel = require('./admin');
        const authRoutes = require('./routes/auth');
        const userRoutes = require('./routes/user');
        const postRoutes = require('./routes/post');
        const commentRoutes = require('./routes/comment');
        const categoryRoutes = require('./routes/category');
        const newsRoutes = require('./routes/newsRoutes');

        // AdminJS reads the body itself, so mount it before express.json()
        await setupAdminPanel(app);

        app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
        app.use(express.json());

        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

        app.use('/api/auth', authRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/posts', postRoutes);
        app.use('/api/comments', commentRoutes);
        app.use('/api/categories', categoryRoutes);
        app.use('/api/news', newsRoutes);

        app.get('/', (req, res) => {
            res.json({ message: 'GeoChill API is running!' });
        });

        app.use((req, res, next) => {
            res.status(404).json({ error: 'Route not found or endpoint does not exist' });
        });

        app.use((err, req, res, next) => {
            console.error('Global error:', err.stack);

            if (err.name === 'MulterError' || (err.message && err.message.toLowerCase().includes('multer'))) {
                return res.status(400).json({ error: err.message || 'File upload error' });
            }
            
            res.status(err.status || 500).json({
                error: err.message || 'Internal Server Error'
            });
        });

        await db.query('SELECT 1');
        console.log('Database connected successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();