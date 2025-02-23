const express = require("express");
const pool = require("../config/db"); // Ensure correct DB connection
const { protect } = require("../middleware/authMiddleware"); // ✅ Ensure user is authenticated

const router = express.Router();

// ✅ Get User Details (Protected)
router.get("/:id", protect, async (req, res) => {
    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Balance & Commission (Protected)
router.get("/:id/balance", protect, async (req, res) => {
    try {
        const user = await pool.query("SELECT balance, commission FROM users WHERE id = $1", [req.params.id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Wallet Details (Protected)
router.get("/wallet/:id", protect, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT username, email, balance, vip_level FROM users WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching wallet details:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get User Profile (Protected)
router.get("/profile", protect, (req, res) => {
    res.json({ message: "User profile loaded", user: req.user });
});

module.exports = router;
