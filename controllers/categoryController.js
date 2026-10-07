const db = require('../config/db');

exports.createCategory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create categories' });
        }

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

exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const [category] = await db.query(`
            SELECT * FROM Categories WHERE id = ?
        `, [categoryId]);

        if (category.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json(category[0]);

    } catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update categories' });
        }

        const { title, description } = req.body;
        const categoryId = req.params.id;
        const titleParam = title !== undefined ? title : null;
        const descriptionParam = description !== undefined ? description : null;

        const [result] = await db.query(
            'UPDATE Categories SET title = IFNULL(?, title), description = IFNULL(?, description) WHERE id = ?',
            [titleParam, descriptionParam, categoryId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ message: 'Category updated successfully' });

    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete categories' });
        }

        const categoryId = req.params.id;

        const [result] = await db.query(
            'DELETE FROM Categories WHERE id = ?',
            [categoryId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });

    } catch (error) {
        console.error('Delete category by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPostCategories = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const [result] = await db.query(`
            SELECT p.id, p.title, p.content, p.publish_date, p.status, u.login AS author
            FROM Posts p
            JOIN Post_Category pc ON p.id = pc.post_id
            JOIN Users u ON p.author_id = u.id
            WHERE pc.category_id = ?
        `, [categoryId]);

        res.status(200).json(result);

    } catch (error) {
        console.error('Get post categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
