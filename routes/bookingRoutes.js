const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // Ensure authentication middleware is correct
const { createBooking, getUserBookings } = require("../controllers/bookingController"); // Ensure correct path

// ✅ Create a Booking
router.post("/create", protect, createBooking);

// ✅ Get User Bookings
router.get("/user/:user_id", protect, getUserBookings);

module.exports = router;
