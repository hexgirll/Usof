const express = require('express');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Connect the authentication routes prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Basic route to test if the server is alive
app.get('/', (req, res) => {
    res.json({ message: 'Usof API is running!' });
});

// Start the server and verify database connection
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    
    try {
        // Send a simple query to test the pool connection
        await db.query('SELECT 1');
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
});