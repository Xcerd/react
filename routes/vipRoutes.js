const express = require("express");
const pool = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// VIP Level Commission Percentages
const vipCommissions = {
    1: 0.007, // Junior Member
    2: 0.008, // Platinum Member
    3: 0.010, // Gold Member
    4: 0.012, // Diamond Member
};

// ✅ Get User VIP Level & Commission (Protected)
router.get("/", protect, async (req, res) => {
    try {
        const user = await pool.query("SELECT vip_level FROM users WHERE id = $1", [req.user.id]);
        if (!user.rows.length) return res.status(404).json({ message: "User not found" });

        res.json({ vip_level: user.rows[0].vip_level, commission: vipCommissions[user.rows[0].vip_level] });
    } catch (error) {
        console.error("Error fetching VIP level:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Calculate Booking Commission (Protected)
router.post("/commission", protect, async (req, res) => {
    const { bookingPrice } = req.body;

    try {
        const user = await pool.query("SELECT vip_level FROM users WHERE id = $1", [req.user.id]);
        if (!user.rows.length) return res.status(404).json({ message: "User not found" });

        const vipLevel = user.rows[0].vip_level;
        const commission = bookingPrice * vipCommissions[vipLevel];

        res.json({ vip_level: vipLevel, commission_earned: commission });
    } catch (error) {
        console.error("Error calculating commission:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
