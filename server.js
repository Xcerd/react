require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

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

// VIP Commission Percentages (Based on Booking Price)
const VIP_LEVELS = {
  1: { name: "Trainee", commission: 2 },
  2: { name: "Junior Member", commission: 5 },
  3: { name: "Senior Member", commission: 7 },
  4: { name: "Platinum Member", commission: 10 },
  5: { name: "Diamond Member", commission: 15 },
};

// Referral Bonus (Separate from Booking Commission)
const REFERRAL_BONUS = 20; // Fixed bonus per referred user

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/transactions", require("./routes/transaction_routes"));
app.use("/api/bookings", require("./routes/booking_routes"));
app.use("/api/reviews", require("./routes/review_routes"));
app.use("/api/password", require("./routes/password_routes"));
app.use("/api/customer-service", require("./routes/customer_service_routes"));
app.use("/api/vip", require("./routes/vip_routes"));
app.use("/api/referrals", require("./routes/referral_routes"));
app.use("/api/history", require("./routes/history_routes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = pool;
