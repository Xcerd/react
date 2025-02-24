const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { addReview, getBookingReviews } = require("../controllers/reviewController");

const router = express.Router();

// ✅ Add a Review (User must be logged in)
router.post("/add", protect, addReview);

// ✅ Get Reviews for a Booking
router.get("/booking/:booking_id", getBookingReviews);

module.exports = router;
