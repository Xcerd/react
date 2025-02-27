const { pool } = require("../config/db");

// ✅ Add a Review
const addReview = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const userId = req.user.id;
        const { booking_id, rating, comment } = req.body;

        if (!booking_id || !rating || !comment) {
            return res.status(400).json({ error: "All fields are required." });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        const review = await pool.query(
            "INSERT INTO reviews (user_id, booking_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
            [userId, booking_id, rating, comment]
        );

        res.status(201).json({ message: "Review submitted successfully.", review: review.rows[0] });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get Reviews for a Booking
const getReviewsByBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const reviews = await pool.query(
            "SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.booking_id = $1",
            [booking_id]
        );

        if (reviews.rows.length === 0) {
            return res.status(404).json({ message: "No reviews found for this booking." });
        }

        res.json(reviews.rows);
    } catch (error) {
        console.error("Error fetching reviews for booking:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get User Reviews
const getUserReviews = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const userId = req.user.id;
        const reviews = await pool.query(
            "SELECT r.*, b.service_name FROM reviews r JOIN bookings b ON r.booking_id = b.id WHERE r.user_id = $1",
            [userId]
        );

        if (reviews.rows.length === 0) {
            return res.status(404).json({ message: "No reviews found for this user." });
        }

        res.json(reviews.rows);
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Delete a Review
const deleteReview = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const { id } = req.params;
        const review = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING *", [id]);

        if (review.rows.length === 0) {
            return res.status(404).json({ error: "Review not found." });
        }

        res.json({ message: "Review deleted successfully." });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Export functions properly
module.exports = { addReview, getReviewsByBooking, getUserReviews, deleteReview };
