const express = require("express");
const { getUserBalance, getRecentBookings } = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/balance", authenticateToken, getUserBalance);
router.get("/bookings/recent", authenticateToken, getRecentBookings);

module.exports = router;
