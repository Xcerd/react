const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // ✅ Correct import
const { VIP_LEVELS } = require("../config/constants"); // ✅ Move VIP_LEVELS to constants.js

// Create a booking
router.post("/create", async (req, res) => {
    const { user_id, service_name, price } = req.body;
    try {
        const booking = await pool.query(
            "INSERT INTO bookings (user_id, service_name, price, status) VALUES ($1, $2, $3, 'pending') RETURNING *",
            [user_id, service_name, price]
        );

        // Fetch user's VIP level
        const user = await pool.query("SELECT vip_level FROM users WHERE id = $1", [user_id]);
        const vipLevel = user.rows[0]?.vip_level || 1;
        const commissionRate = VIP_LEVELS[vipLevel].commission / 100;
        const commissionEarned = price * commissionRate;

        // Update user commission earnings
        await pool.query(
            "UPDATE users SET commission = commission + $1 WHERE id = $2",
            [commissionEarned, user_id]
        );

        res.json({ message: "Booking created successfully", booking: booking.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user bookings
router.get("/user/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
        const bookings = await pool.query("SELECT * FROM bookings WHERE user_id = $1", [user_id]);
        res.json(bookings.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Ensure that ONLY `router` is exported
module.exports = router;
