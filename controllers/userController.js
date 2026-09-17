const db = require('../config/db');

exports.updateProfile = async (req, res) => {
    try {
        // Extract data from the request body
        const { full_name, email } = req.body;
        
        // Retrieve the user ID from the decoded JWT token (injected by middleware)
        const userId = req.user.id;

        // Check if there is anything to update
        if (!full_name && !email) {
            return res.status(400).json({ error: 'Please provide full_name or email to update' });
        }

        // Dynamically build the SQL query based on provided fields
        const updateFields = [];
        const queryParams = [];

        if (full_name) {
            updateFields.push('full_name = ?');
            queryParams.push(full_name);
        }

        if (email) {
            updateFields.push('email = ?');
            queryParams.push(email);
        }

        // Add the user ID for the WHERE clause at the end
        queryParams.push(userId);

        const queryString = `UPDATE Users SET ${updateFields.join(', ')} WHERE id = ?`;

        const [result] = await db.query(queryString, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully' });

    } catch (error) {
        // Handle potential MySQL errors, like duplicate emails
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This email is already in use' });
        }
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.params.id;

        const [posts] = await db.query(`
            SELECT p.id, p.title, p.content, p.publish_date, p.status, u.login AS author
            FROM Posts p
            JOIN Users u ON p.author_id = u.id
            WHERE p.author_id = ?
            ORDER BY p.publish_date DESC
        `, [userId]);

        res.status(200).json(posts);

    } catch (error) {
        console.error('Get all user posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};