const db = require('../config/db');

class Post {
    static async findAll(options = {}, userParam = null) {
        const page = parseInt(options.page, 10) || 1;
        let limit = parseInt(options.limit, 10) || 10;
        if (isNaN(limit) || limit <= 0) limit = 10;
        if (limit > 100) limit = 100; // Безпековий ліміт від SQL-ін'єкцій та перенавантаження

        const search = options.search || '';
        const category = options.category || null;
        const author_id = options.author_id || null;
        const sortBy = options.sortBy || 'rating';
        const sortOrder = options.sortOrder || 'DESC';
        const user = userParam || options.user || null;
        
        // Повернуті фільтри
        const status = options.status || null; 
        const date_from = options.date_from || null;
        const date_to = options.date_to || null;

        const offset = (page - 1) * limit;
        const whereConditions = [];
        const queryParams = [];

        // Розумний Status visibility filter
        if (!user || user.role !== 'admin') {
            if (user) {
                if (status === 'inactive') {
                    whereConditions.push(`p.status = 'inactive' AND p.author_id = ?`);
                    queryParams.push(user.id);
                } else if (status === 'active') {
                    whereConditions.push(`p.status = 'active'`);
                } else {
                    whereConditions.push(`(p.status = 'active' OR p.author_id = ?)`);
                    queryParams.push(user.id);
                }
            } else {
                whereConditions.push(`p.status = 'active'`);
            }
        } else {
            if (status === 'active' || status === 'inactive') {
                whereConditions.push(`p.status = ?`);
                queryParams.push(status);
            }
        }

        // Author filter
        if (author_id) {
            whereConditions.push(`p.author_id = ?`);
            queryParams.push(author_id);
        }

        // Search filter
        if (search && search !== 'undefined') {
            whereConditions.push(`(p.title LIKE ? OR p.content LIKE ?)`);
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        // Category filter
        if (category && category !== 'undefined') {
            whereConditions.push(`p.id IN (SELECT post_id FROM Post_Category WHERE category_id = ?)`);
            queryParams.push(category);
        }

        // Date interval filters
        if (date_from && date_from !== 'undefined') {
            whereConditions.push(`DATE(p.publish_date) >= ?`);
            queryParams.push(date_from);
        }
        if (date_to && date_to !== 'undefined') {
            whereConditions.push(`DATE(p.publish_date) <= ?`);
            queryParams.push(date_to);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Standardize sort columns (use alias 'rating' computed from subquery)
        const allowedSortFields = {
            'rating': 'rating',
            'publish_date': 'p.publish_date'
        };
        const sortColumn = allowedSortFields[sortBy] || 'rating';
        const order = (sortOrder && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        // Query total count for pagination
        const countQuery = `
            SELECT COUNT(DISTINCT p.id) as total 
            FROM Posts p 
            LEFT JOIN Users u ON p.author_id = u.id 
            ${whereClause}
        `;
        const [[{ total }]] = await db.query(countQuery, queryParams);

        // Fetch paginated records with dynamically calculated rating
        const dataQuery = `
            SELECT 
                p.id, 
                p.title, 
                p.content, 
                p.publish_date, 
                p.status, 
                p.author_id, 
                u.login AS author,
                COALESCE((
                    SELECT SUM(CASE WHEN type = 'like' THEN 1 WHEN type = 'dislike' THEN -1 ELSE 0 END)
                    FROM Likes
                    WHERE post_id = p.id
                ), 0) AS rating
            FROM Posts p
            LEFT JOIN Users u ON p.author_id = u.id
            ${whereClause}
            ORDER BY ${sortColumn} ${order}, p.id DESC
            LIMIT ? OFFSET ?
        `;
        const [posts] = await db.query(dataQuery, [...queryParams, parseInt(limit, 10), Math.max(0, parseInt(offset, 10))]);

        return {
            data: posts,
            pagination: {
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
                totalItems: total
            }
        };
    }

    static async findById(id, user = null) {
        const [posts] = await db.query(`
            SELECT 
                p.id, 
                p.title, 
                p.content, 
                p.publish_date, 
                p.status, 
                p.author_id, 
                u.login AS author,
                COALESCE((
                    SELECT SUM(CASE WHEN type = 'like' THEN 1 WHEN type = 'dislike' THEN -1 ELSE 0 END)
                    FROM Likes
                    WHERE post_id = p.id
                ), 0) AS rating
            FROM Posts p
            LEFT JOIN Users u ON p.author_id = u.id
            WHERE p.id = ?
        `, [id]);

        const post = posts[0];
        if (!post) return null;

        if (post.status !== 'active') {
            const isOwnerOrAdmin = user && (user.id === post.author_id || user.role === 'admin');
            if (!isOwnerOrAdmin) return null;
        }

        return post;
    }

    static async create(authorId, title, content) {
        const [result] = await db.query(
            'INSERT INTO Posts (author_id, title, content, status, publish_date) VALUES (?, ?, ?, "active", NOW())',
            [authorId, title, content]
        );
        return result.insertId;
    }

    static async update(id, updateData) {
        const fields = [];
        const values = [];

        if (updateData.title !== undefined) {
            fields.push('title = ?');
            values.push(updateData.title);
        }
        if (updateData.content !== undefined) {
            fields.push('content = ?');
            values.push(updateData.content);
        }
        if (updateData.status !== undefined) {
            fields.push('status = ?');
            values.push(updateData.status);
        }

        if (fields.length === 0) return false;

        values.push(id);
        const [result] = await db.query(`UPDATE Posts SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM Posts WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async addCategories(postId, categories) {
        if (!categories || categories.length === 0) return;
        const values = categories.map(catId => [postId, catId]);
        await db.query('INSERT IGNORE INTO Post_Category (post_id, category_id) VALUES ?', [values]);
    }

    static async updateCategories(postId, categories) {
        await db.query('DELETE FROM Post_Category WHERE post_id = ?', [postId]);
        if (categories && categories.length > 0) {
            await Post.addCategories(postId, categories);
        }
    }

    static async getCategories(postId) {
        const [categories] = await db.query(`
            SELECT c.id, c.title, c.description
            FROM Categories c
            JOIN Post_Category pc ON c.id = pc.category_id
            WHERE pc.post_id = ?
        `, [postId]);
        return categories;
    }
}

module.exports = Post;