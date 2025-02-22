const express = require("express");
const pool = require("../config/db"); // Ensure correct DB connection
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware"); // Ensure user is authenticated


// ✅ Get User Details
router.get("/:id", async (req, res) => {
    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Balance & Commission
router.get("/:id/balance", async (req, res) => {
    try {
        const user = await pool.query("SELECT balance, commission FROM users WHERE id = $1", [req.params.id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/wallet/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT username, email, balance, vip_level FROM users WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching wallet details:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
