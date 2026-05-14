import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
    const token = req.header("auth-token");

    if (!token) {
        // No token provided, proceed without authentication
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userId    = decoded.user?.id   || null;
        req.userEmail = decoded.user?.email || null;

        console.log("UserId from token:", req.userId);
        console.log("UserEmail from token:", req.userEmail);
    } catch (_) {
        // Expired or invalid — proceed anonymously, never block
    }

    next();

};

export default optionalAuth;