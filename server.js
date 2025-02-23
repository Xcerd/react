require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debugging: Log what is being imported
console.log("Loading routes...");

// Import Database Connection
const pool = require("./database"); // ✅ Ensures database is loaded

// Import Routes
let authRoutes, userRoutes, transactionRoutes, bookingRoutes, reviewRoutes;
let passwordRoutes, customerServiceRoutes, vipRoutes, referralRoutes, historyRoutes;

// Use Try-Catch to Debug Errors
try {
    authRoutes = require("./routes/authRoutes");
    app.use("/api/auth", authRoutes);
    console.log("✔️ Auth Routes Loaded");
} catch (error) {
    console.error("❌ Error loading authRoutes:", error.message);
}

try {
    userRoutes = require("./routes/userRoutes");
    app.use("/api/users", userRoutes);
    console.log("✔️ User Routes Loaded");
} catch (error) {
    console.error("❌ Error loading userRoutes:", error.message);
}

try {
    transactionRoutes = require("./routes/transactionRoutes");
    app.use("/api/transactions", transactionRoutes);
    console.log("✔️ Transaction Routes Loaded");
} catch (error) {
    console.error("❌ Error loading transactionRoutes:", error.message);
}

try {
    bookingRoutes = require("./routes/bookingRoutes");
    app.use("/api/bookings", bookingRoutes);
    console.log("✔️ Booking Routes Loaded");
} catch (error) {
    console.error("❌ Error loading bookingRoutes:", error.message);
}

try {
    reviewRoutes = require("./routes/reviewRoutes");
    app.use("/api/reviews", reviewRoutes);
    console.log("✔️ Review Routes Loaded");
} catch (error) {
    console.error("❌ Error loading reviewRoutes:", error.message);
}

try {
    passwordRoutes = require("./routes/passwordRoutes");
    app.use("/api/password", passwordRoutes);
    console.log("✔️ Password Routes Loaded");
} catch (error) {
    console.error("❌ Error loading passwordRoutes:", error.message);
}

try {
    customerServiceRoutes = require("./routes/customerServiceRoutes");
    app.use("/api/customer-service", customerServiceRoutes);
    console.log("✔️ Customer Service Routes Loaded");
} catch (error) {
    console.error("❌ Error loading customerServiceRoutes:", error.message);
}

try {
    vipRoutes = require("./routes/vipRoutes");
    app.use("/api/vip", vipRoutes);
    console.log("✔️ Vip Routes Loaded");
} catch (error) {
    console.error("❌ Error loading vipRoutes:", error.message);
}

try {
    referralRoutes = require("./routes/referralRoutes");
    app.use("/api/referrals", referralRoutes);
    console.log("✔️ Referral Routes Loaded");
} catch (error) {
    console.error("❌ Error loading referralRoutes:", error.message);
}

try {
    historyRoutes = require("./routes/historyRoutes");
    app.use("/api/history", historyRoutes);
    console.log("✔️ History Routes Loaded");
} catch (error) {
    console.error("❌ Error loading historyRoutes:", error.message);
}

// Default Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
