const express = require("express");
const pool = require("../config/db"); 
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get Logged-in User Profile (Secure)
router.get("/profile", protect, async (req, res) => {
    try {
        const user = await pool.query(
            "SELECT id, username, email, balance, vip_level, reputation, referral_code FROM users WHERE id = $1",
            [req.user.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get Wallet Details (Includes Balance, Reputation, VIP Level)
router.get("/wallet", protect, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT username, email, balance, vip_level, reputation, commission, referral_code FROM users WHERE id = $1",
            [req.user.id]
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

router.get("/:id/balance", protect, async (req, res) => {
    try {
        const userId = req.params.id;

        const result = await pool.query("SELECT balance FROM users WHERE id = $1", [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ balance: result.rows[0].balance });
    } catch (error) {
        console.error("❌ Error fetching user balance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:id/bookings", protect, async (req, res) => {
    try {
        const userId = req.params.id;

        const result = await pool.query("SELECT * FROM bookings WHERE user_id = $1", [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No bookings found" });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;
