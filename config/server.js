require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { VIP_LEVELS, REFERRAL_BONUS } = require("./config/constants"); // ✅ Fix import

const app = express();

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const bookingRoutes = require("./routes/bookingRoutes"); 
const reviewRoutes = require("./routes/reviewRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const customerServiceRoutes = require("./routes/customerServiceRoutes");
const vipRoutes = require("./routes/vipRoutes");
const referralRoutes = require("./routes/referralRoutes");
const historyRoutes = require("./routes/historyRoutes");

// Apply Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/customer-service", customerServiceRoutes);
app.use("/api/vip", vipRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/history", historyRoutes);

// Start Server
const PORT = process.env.PORT || 5432;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ✅ Export only pool (No VIP_LEVELS)
module.exports = { pool };
