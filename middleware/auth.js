const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // The token is usually sent in the 'Authorization' header
    // Format: "Bearer <token_string>"
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Split the string by space and take the second part (the token itself)
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Invalid token format.' });
    }

    try {
        // Verify the token using the secret key from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the decoded user data (id, role) to the request object
        // This makes req.user available in all subsequent controllers
        req.user = decoded;
        
        // Pass control to the next middleware or route handler
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};