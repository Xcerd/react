const express = require("express");
const pool = require("../config/db"); 
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get Logged-in User Details (Secure)
router.get("/profile", protect, async (req, res) => {
    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

        res.json(user.rows[0]);
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Balance & Commission (Secure)
router.get("/balance", protect, async (req, res) => {
    try {
        const user = await pool.query("SELECT balance, commission FROM users WHERE id = $1", [req.user.id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

        res.json(user.rows[0]);
    } catch (err) {
        console.error("Error fetching balance:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get Wallet Details (Secure)
router.get("/wallet", protect, async (req, res) => {
    try {
        const result = await pool.query("SELECT username, email, balance, vip_level FROM users WHERE id = $1", [req.user.id]);
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
