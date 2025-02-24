const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createBooking, getServices } = require("../controllers/bookingController");

const router = express.Router();

// ✅ Create a Booking
router.post("/create", protect, createBooking);

// ✅ Get Available Services
router.get("/services", getServices);

module.exports = router;
