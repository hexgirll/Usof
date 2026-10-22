const Category = require('../models/Category');
const Post = require('../models/Post'); // Imported Post model for secure fetching

// Create a new category (Admin only)
exports.createCategory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create categories' });
        }

        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        await Category.create(title, description);
        res.status(201).json({ message: 'Category created successfully' });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all available categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a specific category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update an existing category (Admin only)
exports.updateCategory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update categories' });
        }

        const { title, description } = req.body;
        const categoryId = req.params.id;
        const titleParam = title !== undefined ? title : null;
        const descriptionParam = description !== undefined ? description : null;

        const updated = await Category.update(categoryId, titleParam, descriptionParam);
        if (!updated) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a category (Admin only)
exports.deleteCategory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete categories' });
        }

        const categoryId = req.params.id;
        const deleted = await Category.delete(categoryId);

        if (!deleted) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get posts associated with a category ID
exports.getPostCategories = async (req, res) => {
    try {
        // Use the universal Post.findAll method which already handles
        // pagination, sorting, search, and hiding inactive posts securely
        const options = { ...req.query, category: req.params.id };
        const posts = await Post.findAll(options, req.user);
        
        res.status(200).json(posts);
    } catch (error) {
        console.error('Get category posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};