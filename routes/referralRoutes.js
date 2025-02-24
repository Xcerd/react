const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

// ✅ Get referral code
router.get("/my-code", protect, async (req, res) => {
    try {
        const referralRes = await db.query("SELECT referral_code FROM users WHERE id = $1", [req.user.id]);
        res.json({ referralCode: referralRes.rows[0]?.referral_code || "N/A" });
    } catch (error) {
        res.status(500).json({ error: "Error fetching referral code" });
    }
});

// ✅ Get referral earnings
router.get("/earnings", protect, async (req, res) => {
    try {
        const earningsRes = await db.query("SELECT SUM(amount) AS total FROM commissions WHERE user_id = $1", [req.user.id]);
        res.json({ totalEarnings: earningsRes.rows[0]?.total || 0 });
    } catch (error) {
        res.status(500).json({ error: "Error fetching referral earnings" });
    }
});

module.exports = router;
