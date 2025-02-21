const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Add a review
router.post("/add", async (req, res) => {
    const { user_id, booking_id, rating, comment } = req.body;
    try {
        // Ensure the booking exists and belongs to the user
        const booking = await pool.query(
            "SELECT * FROM bookings WHERE id = $1 AND user_id = $2",
            [booking_id, user_id]
        );
        
        if (booking.rows.length === 0) {
            return res.status(404).json({ error: "Booking not found or does not belong to user." });
        }

        // Insert review
        const review = await pool.query(
            "INSERT INTO reviews (user_id, booking_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_id, booking_id, rating, comment]
        );

        res.json({ message: "Review submitted successfully", review: review.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get reviews for a booking
router.get("/booking/:booking_id", async (req, res) => {
    const { booking_id } = req.params;
    try {
        const reviews = await pool.query(
            "SELECT * FROM reviews WHERE booking_id = $1",
            [booking_id]
        );
        res.json(reviews.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

