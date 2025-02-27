const express = require("express");
const router = express.Router();
const { protect, verifyAdmin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// ✅ Fetch all users
router.get("/users", protect, verifyAdmin, adminController.getAllUsers);

// ✅ Update User Reputation
router.post("/update-reputation", protect, verifyAdmin, adminController.updateUserReputation);

// ✅ Approve Transaction
router.post("/approve-transaction", protect, verifyAdmin, adminController.approveTransaction);

// ✅ Update User's Booking, Rewards, & VIP Level
router.put("/update-user", protect, verifyAdmin, adminController.updateUser);

// ✅ Update User Balance
router.put("/update-user-balance", protect, verifyAdmin, adminController.updateUserBalance);

// ✅ Update Booking Status
router.put("/update-booking", protect, verifyAdmin, adminController.updateBooking);

// ✅ Reset Daily Bookings
router.put("/reset-daily-bookings", protect, verifyAdmin, adminController.resetDailyBookings);

module.exports = router;
