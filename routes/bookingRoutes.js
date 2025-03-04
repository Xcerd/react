const express = require("express");
const pool = require("../config/db"); 
const { protect } = require("../middleware/authMiddleware");

const router = express.Router(); // ✅ Fix: Define router

// ✅ Get Authenticated User's Bookings
const getUserBookings = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const userId = req.user.id; // ✅ Use authenticated user ID
        const bookings = await pool.query(
            "SELECT id, service_name, price, commission, status, booking_date FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC",
            [userId]
        );

        if (bookings.rows.length === 0) {
            return res.status(404).json({ message: "No bookings found" });
        }

        res.json(bookings.rows);
    } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        res.status(500).json({ message: "Error fetching bookings", error });
    }
};

// ✅ Route to Get User's Bookings
router.get("/user", protect, getUserBookings);

module.exports = router;
