const Post = require('../models/Post');

exports.createPost = async (req, res) => {
    try {
        const { title, content, categories } = req.body;
        const authorId = req.user.id; 

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const postId = await Post.create(authorId, title, content);

        if (categories && categories.length > 0) {
            await Post.addCategories(postId, categories);
        }

        res.status(201).json({ message: 'Post created successfully', postId });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll(req.query, req.user);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Get all posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        // Передаємо req.user, щоб власник/адмін міг завантажити свій неактивний пост
        const post = await Post.findById(postId, req.user);

        if (!post) {
            return res.status(404).json({ error: 'Post not found or access denied' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Get post by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, categories, status } = req.body;
        
        const post = await Post.findById(id, req.user);
        if (!post) {
            return res.status(404).json({ error: 'Post not found or access denied' });
        }

        const isOwner = req.user && post.author_id === req.user.id;
        const isAdmin = req.user && req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        // PDF Rules: Admin cannot edit content/title of OTHER people's posts
        if (isAdmin && !isOwner && (title !== undefined || content !== undefined)) {
            return res.status(403).json({ error: 'Admins can only change status and categories of other users\' posts.' });
        }

        const updateData = {};
        if (isOwner) {
            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;
        }
        if (status !== undefined) updateData.status = status;

        if (Object.keys(updateData).length > 0) {
            await Post.update(id, updateData);
        }

        if (categories && Array.isArray(categories)) {
            await Post.updateCategories(id, categories);
        }

        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Internal server error' }); // Заховали error.message
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        // Передаємо req.user, щоб не було 404 на власний неактивний пост
        const post = await Post.findById(postId, req.user);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found or access denied' });
        }

        if (req.user.role !== 'admin' && req.user.id !== post.author_id) {
            return res.status(403).json({ error: 'Unauthorized to delete this post' });
        }

        await Post.delete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPostCategories = async (req, res) => {
    try {
        const postId = req.params.postId;
        const categories = await Post.getCategories(postId);
        res.status(200).json(categories);
    } catch (error) {
        console.error('Get post categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};