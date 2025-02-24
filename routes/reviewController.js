const db = require("../config/db");

// ✅ Add a Review (User must have booked the service)
exports.addReview = async (req, res) => {
    const { booking_id, rating, comment } = req.body;
    const user_id = req.user.id;

    try {
        // Check if user booked this service
        const booking = await db.query(
            "SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND status = 'completed'",
            [booking_id, user_id]
        );

        if (booking.rows.length === 0) {
            return res.status(403).json({ error: "You can only review completed bookings." });
        }

        // Insert Review
        const review = await db.query(
            "INSERT INTO reviews (user_id, booking_id, service_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [user_id, booking_id, booking.rows[0].service_id, rating, comment]
        );

        res.json({ message: "Review added successfully!", review: review.rows[0] });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Get Reviews for a Booking
exports.getBookingReviews = async (req, res) => {
    const { booking_id } = req.params;

    try {
        const reviews = await db.query("SELECT * FROM reviews WHERE booking_id = $1", [booking_id]);
        res.json(reviews.rows);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Server error" });
    }
};
