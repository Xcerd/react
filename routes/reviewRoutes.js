const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { addReview, getReviewsByBooking, getUserReviews, deleteReview } = require("../controllers/reviewController"); // Ensure correct path

// ✅ Add a Review
router.post("/add", protect, addReview);

// ✅ Get Reviews for a Booking
router.get("/booking/:booking_id", getReviewsByBooking);

// ✅ Get User Reviews
router.get("/user/:user_id", protect, getUserReviews);

// ✅ Delete a Review
router.delete("/:id", protect, deleteReview);

module.exports = router;
