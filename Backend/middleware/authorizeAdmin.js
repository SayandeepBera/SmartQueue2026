import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SECRET_KEY;

const authorizeAdmin = async (req, res, next) => {
    const token = req.header('auth-token');
    console.log("Admin authorization attempt with token:", token);

    try {
        // Check if token is provided
        if(!token) {
            return res.status(401).json({ success: false, error: "Access denied. No token provided." });
        }

        // Verify token and extract user info
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;

        // Only allow users with "admin" role to proceed
        if(req.user.role !== "admin") {
            return res.status(403).json({ success: false, error: "Access denied. Admins only allowed." });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: "Invalid or expired token. Please log in again." });
    }
}

export default authorizeAdmin;