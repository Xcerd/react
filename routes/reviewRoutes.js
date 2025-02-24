const express = require("express");
const { pool } = require("../config/db");
const router = express.Router();

// ✅ Add a Review
router.post("/add", async (req, res) => {
    const { user_id, booking_id, rating, comment } = req.body;
    try {
        const review = await pool.query(
            "INSERT INTO reviews (user_id, booking_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_id, booking_id, rating, comment]
        );
        res.json(review.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get Reviews for a Booking
router.get("/booking/:booking_id", async (req, res) => {
    try {
        const reviews = await pool.query("SELECT * FROM reviews WHERE booking_id = $1", [req.params.booking_id]);
        res.json(reviews.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
