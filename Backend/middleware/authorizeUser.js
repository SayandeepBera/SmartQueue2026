import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SECRET_KEY;

const authorizeUser = async (req, res, next) => {
    const token = req.header('auth-token');
    console.log("User authorization attempt with token:", token);

    try {
        // Check if token is provided
        if(!token) {
            return res.status(401).json({ success: false, error: "Access denied. No token provided." });
        }

        // Verify token and extract user info
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;

        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: "Invalid or expired token. Please log in again." });
    }
}

export default authorizeUser;