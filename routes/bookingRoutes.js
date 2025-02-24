const express = require("express");
const pool = require("../config/db"); 
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Create a Booking (Protected)
router.post("/create", protect, async (req, res) => {
    try {
        const { service_name } = req.body;

        if (!service_name) {
            return res.status(400).json({ error: "Missing service name" });
        }

        const newBooking = await pool.query(
            "INSERT INTO bookings (user_id, service_name, status) VALUES ($1, $2, 'pending') RETURNING *",
            [req.user.id, service_name]
        );

        res.json(newBooking.rows[0]);
    } catch (err) {
        console.error("Error creating booking:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
