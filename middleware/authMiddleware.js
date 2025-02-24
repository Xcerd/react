const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Middleware to protect routes (Requires a valid token)
const protect = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};

// Middleware to verify Admin (Requires user to be an admin)
const verifyAdmin = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(403).json({ error: "Access denied. User not authenticated." });
    }

    try {
        const result = await db.query("SELECT isAdmin FROM users WHERE id = $1", [req.user.id]);

        if (!result.rows.length || !result.rows[0].isadmin) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        next(); // Continue to next middleware or route handler
    } catch (error) {
        console.error("Error verifying admin:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { protect, verifyAdmin };
