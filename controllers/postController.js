const Post = require('../models/Post');
const db = require('../config/db');

exports.createPost = async (req, res) => {
    try {
        const { title, content, categories, latitude, longitude } = req.body;
        const authorId = req.user.id; 

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const postId = await Post.create(
            authorId, 
            title, 
            content, 
            latitude || null, 
            longitude || null
        );

        if (categories) {
            const parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
            if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
                await Post.addCategories(postId, parsedCategories);
            }
        }

        if (req.files && req.files.length > 0) {
            const imageQueries = req.files.map((file, index) => [
                postId,
                file.filename,
                index
            ]);
            await db.query(
                'INSERT INTO Post_Images (post_id, filename, sort_order) VALUES ?',
                [imageQueries]
            );
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
        const { title, content, categories, status, latitude, longitude } = req.body;
        
        const post = await Post.findById(id, req.user);
        if (!post) {
            return res.status(404).json({ error: 'Post not found or access denied' });
        }

        const isOwner = req.user && post.author_id === req.user.id;
        const isAdmin = req.user && req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        if (isAdmin && !isOwner && (title !== undefined || content !== undefined)) {
            return res.status(403).json({ error: 'Admins can only change status and categories of other users\' posts.' });
        }

        const updateData = {};
        if (isOwner) {
            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;
            if (latitude !== undefined) updateData.latitude = latitude || null;
            if (longitude !== undefined) updateData.longitude = longitude || null;
        }
        if (status !== undefined) updateData.status = status;

        if (Object.keys(updateData).length > 0) {
            await Post.update(id, updateData);
        }

        if (categories !== undefined) {
            const parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
            if (Array.isArray(parsedCategories)) {
                await Post.updateCategories(id, parsedCategories);
            }
        }

        if (req.files && req.files.length > 0) {
            const [existingImages] = await db.query('SELECT MAX(sort_order) as maxOrder FROM Post_Images WHERE post_id = ?', [id]);
            let startOrder = (existingImages[0]?.maxOrder ?? -1) + 1;

            const imageQueries = req.files.map((file, index) => [
                id,
                file.filename,
                startOrder + index
            ]);
            await db.query(
                'INSERT INTO Post_Images (post_id, filename, sort_order) VALUES ?',
                [imageQueries]
            );
        }

        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
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

        const post = await Post.findById(postId, req.user || null);
        if (!post) {
            return res.status(404).json({ error: 'Post not found or inaccessible' });
        }

        const categories = await Post.getCategories(postId);
        res.status(200).json(categories);
    } catch (error) {
        console.error('Get post categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};