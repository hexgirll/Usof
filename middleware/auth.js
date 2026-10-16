const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Invalid token format.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

exports.optionalAuth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                req.user = jwt.verify(token, process.env.JWT_SECRET);
            } catch (error) {
                // Ignore invalid token, proceed as a guest user
            }
        }
    }
    next();
};