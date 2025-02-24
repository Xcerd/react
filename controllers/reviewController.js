const express = require("express");
const { pool } = require("../config/db"); // Ensure the correct database configuration
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // Protect routes

// ✅ Add a Review (Protected)
router.post("/add", protect, async (req, res) => {
    const { user_id, booking_id, rating, comment } = req.body;

    if (!user_id || !booking_id || !rating || !comment) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Check if booking exists
        const booking = await pool.query("SELECT * FROM bookings WHERE id = $1 AND user_id = $2", [booking_id, user_id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ error: "Booking not found or does not belong to user." });
        }

        // Insert the review
        const review = await pool.query(
            "INSERT INTO reviews (user_id, booking_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_id, booking_id, rating, comment]
        );

        res.status(201).json({ message: "Review submitted successfully.", review: review.rows[0] });

    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get Reviews for a Booking
router.get("/booking/:booking_id", async (req, res) => {
    try {
        const { booking_id } = req.params;
        const reviews = await pool.query("SELECT * FROM reviews WHERE booking_id = $1", [booking_id]);

        if (reviews.rows.length === 0) {
            return res.status(404).json({ message: "No reviews found for this booking." });
        }

        res.json(reviews.rows);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Reviews (Protected)
router.get("/user/:user_id", protect, async (req, res) => {
    try {
        const { user_id } = req.params;
        const reviews = await pool.query("SELECT * FROM reviews WHERE user_id = $1", [user_id]);

        if (reviews.rows.length === 0) {
            return res.status(404).json({ message: "No reviews found for this user." });
        }

        res.json(reviews.rows);
    } catch (err) {
        console.error("Error fetching user reviews:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Delete a Review (Protected)
router.delete("/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;
        const review = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING *", [id]);

        if (review.rows.length === 0) {
            return res.status(404).json({ error: "Review not found." });
        }

        res.json({ message: "Review deleted successfully." });
    } catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
