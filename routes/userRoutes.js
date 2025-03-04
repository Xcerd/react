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
        if (!req.user || !req.user.id) {
            console.log("❌ No user found in request.");
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const userId = req.user.id;
        console.log(`🔍 Fetching wallet for User ID: ${userId}`);

        const result = await pool.query("SELECT balance FROM users WHERE id = $1", [userId]);

        if (result.rows.length === 0) {
            console.log(`⚠️ No user found in database with ID: ${userId}`);
            return res.status(404).json({ error: "User not found" });
        }

        let balance = parseFloat(result.rows[0].balance);
        if (isNaN(balance)) balance = 0; // ✅ Prevent frontend crash

        console.log(`✅ Wallet Data: ${balance}`);
        res.json({ balance });
    } catch (error) {
        console.error("❌ Error fetching wallet data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Get User Balance by ID
router.get("/:id/balance", protect, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching balance for User ID: ${id}`);

        const result = await pool.query("SELECT balance FROM users WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            console.log(`⚠️ No user found for ID: ${id}`);
            return res.status(404).json({ error: "User not found" });
        }

        let balance = parseFloat(result.rows[0].balance);
        if (isNaN(balance)) balance = 0;

        console.log(`✅ User Balance: ${balance}`);
        res.json({ balance });
    } catch (error) {
        console.error("❌ Error fetching user balance:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Bookings
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

// ✅ Get Today's Rewards
router.get("/:id/todays-rewards", protect, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching today's rewards for User ID: ${id}`);

        const result = await pool.query("SELECT todays_rewards FROM users WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            console.log(`⚠️ No user found for ID: ${id}`);
            return res.status(404).json({ error: "User not found" });
        }

        let todays_rewards = parseFloat(result.rows[0].todays_rewards);
        if (isNaN(todays_rewards)) todays_rewards = 0;

        console.log(`✅ Today's Rewards: ${todays_rewards}`);
        res.json({ todays_rewards });
    } catch (error) {
        console.error("❌ Error fetching today's rewards:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
