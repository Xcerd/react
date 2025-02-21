const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Referral Bonus Amount
const referralBonus = 5.00; // Fixed bonus for each referral

// Register with Referral Code
router.post("/register", async (req, res) => {
    const { username, email, password, referrerId } = req.body;

    try {
        // Check if referrer exists
        if (referrerId) {
            const referrer = await db.query("SELECT id FROM users WHERE id = $1", [referrerId]);
            if (!referrer.rows.length) {
                return res.status(400).json({ message: "Invalid referral code" });
            }

            // Add referral bonus to referrer
            await db.query("UPDATE users SET commission = commission + $1 WHERE id = $2", 
                           [referralBonus, referrerId]);
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO users (username, email, password, referrer_id) VALUES ($1, $2, $3, $4)",
            [username, email, hashedPassword, referrerId || null]
        );

        res.json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Get Referral Earnings
router.get("/earnings", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const earnings = await db.query("SELECT commission FROM users WHERE id = $1", [userId]);
        if (!earnings.rows.length) return res.status(404).json({ message: "User not found" });

        res.json({ total_earnings: earnings.rows[0].commission });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
