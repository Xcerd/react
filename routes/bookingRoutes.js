const express = require("express");
const { createBooking, getUserBookings } = require("../controllers/bookingController"); // ✅ Ensure correct path
const { protect } = require("../middleware/authMiddleware"); // ✅ Ensure middleware exists

const router = express.Router();

// 🚀 Debugging: Check if imported functions exist
console.log("createBooking:", createBooking);
console.log("getUserBookings:", getUserBookings);

// ✅ Create Booking Route (Ensure Function Exists)
router.post("/create", protect, createBooking);

// ✅ Get User Bookings Route (Ensure Function Exists)
router.get("/user/:user_id", protect, getUserBookings);

module.exports = router;
