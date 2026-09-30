const db = require('../config/db');

exports.createCategory = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const [result] = await db.query(
            'INSERT INTO Categories (title, description) VALUES (?, ?)',
            [title, description]
        );

        res.status(201).json({ message: 'Category created successfully' });

    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT * FROM Categories
        `);

        res.status(200).json(result);

    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

