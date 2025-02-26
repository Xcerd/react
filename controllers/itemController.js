const pool = require("../config/db"); // Import your database connection

// ✅ Fetch all items from the database
const getItems = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM items ORDER BY id ASC");
        res.json(result.rows); // Send data as JSON to frontend
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getItems };
