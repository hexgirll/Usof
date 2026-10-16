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
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Block access to someone else’s inactive post
        const isAuthor = req.user && req.user.id === post.author_id;
        const isAdmin = req.user && req.user.role === 'admin';

        if (post.status === 'inactive' && !isAuthor && !isAdmin) {
            return res.status(403).json({ error: 'Access denied to this inactive post' });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error('Get post by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { title, content, categories, status } = req.body;
        const postId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const isAuthor = post.author_id === userId;
        const isAdmin = userRole === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized to update this post' });
        }

        let updateFields = [];
        let queryParams = [];

        // Admin: can change the status, but not the content
        if (isAdmin && !isAuthor) {
            if (title !== undefined || content !== undefined || categories !== undefined) {
                return res.status(403).json({ error: 'Admins cannot edit content of other users' });
            }
            if (status !== undefined) {
                updateFields.push('status = ?');
                queryParams.push(status);
            }
        } 
        // Author: can change everything
        else if (isAuthor) {
            if (title !== undefined) { updateFields.push('title = ?'); queryParams.push(title); }
            if (content !== undefined) { updateFields.push('content = ?'); queryParams.push(content); }
            if (status !== undefined) { updateFields.push('status = ?'); queryParams.push(status); }
        }

        if (updateFields.length > 0) {
            await Post.update(postId, updateFields, queryParams);
        }

        if (isAuthor && categories && Array.isArray(categories)) {
            await Post.clearCategories(postId);
            await Post.addCategories(postId, categories);
        }

        res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Update post by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Admins now have the right to delete other people’s posts
        if (userRole !== 'admin' && userId !== post.author_id) {
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