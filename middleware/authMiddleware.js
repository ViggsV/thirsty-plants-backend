const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.split(' ')[1];

    // Check if token exists after splitting
    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Attach the decoded user information to the request object
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Authentication error:", err);
        
        // Provide specific error messages based on error type
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Access token expired",
                expired: true 
            });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid access token" });
        } else {
            return res.status(401).json({ message: "Token verification failed" });
        }
    }
};

module.exports = authMiddleware;