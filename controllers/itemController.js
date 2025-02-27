const pool = require("../config/db"); // Import database connection

// ✅ Fetch all items from the database
const getItems = async (req, res) => {
    try {
        if (!pool) {
            console.error("Database connection (pool) is not defined.");
            return res.status(500).json({ error: "Database connection error" });
        }

        // ✅ Limit query for performance
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100; // Default: 100 items
        const result = await pool.query("SELECT * FROM items ORDER BY id ASC LIMIT $1", [limit]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No items found." });
        }

        res.json(result.rows); // Send data as JSON to frontend
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getItems };
