const express = require("express");
const pool = require("../config/db"); 
const { protect } = require("../middleware/authMiddleware");


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

        res.json(bookings.rows);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Error fetching bookings", error });
    }
};
