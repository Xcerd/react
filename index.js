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

// Declare route variables BEFORE the try blocks
let authRoutes, userRoutes, transactionRoutes, bookingRoutes, reviewRoutes;
let passwordRoutes, customerServiceRoutes, vipRoutes, referralRoutes, historyRoutes;

// Import Routes inside try-catch
try {
    authRoutes = require("./routes/authRoutes");
    console.log("✔️ Auth Routes Loaded");
} catch (error) {
    console.error("❌ Error loading authRoutes:", error.message);
}

try {
    userRoutes = require("./routes/userRoutes");
    console.log("✔️ User Routes Loaded");
} catch (error) {
    console.error("❌ Error loading userRoutes:", error.message);
}

try {
    transactionRoutes = require("./routes/transactionRoutes");
    console.log("✔️ Transaction Routes Loaded");
} catch (error) {
    console.error("❌ Error loading transactionRoutes:", error.message);
}

try {
    bookingRoutes = require("./routes/bookingRoutes");
    console.log("✔️ Booking Routes Loaded");
} catch (error) {
    console.error("❌ Error loading bookingRoutes:", error.message);
}

try {
    reviewRoutes = require("./routes/reviewRoutes");
    console.log("✔️ Review Routes Loaded");
} catch (error) {
    console.error("❌ Error loading reviewRoutes:", error.message);
}

try {
    passwordRoutes = require("./routes/passwordRoutes");
    console.log("✔️ Password Routes Loaded");
} catch (error) {
    console.error("❌ Error loading passwordRoutes:", error.message);
}

try {
    customerServiceRoutes = require("./routes/customerServiceRoutes");
    console.log("✔️ Customer Service Routes Loaded");
} catch (error) {
    console.error("❌ Error loading customerServiceRoutes:", error.message);
}

try {
    vipRoutes = require("./routes/vipRoutes");
    console.log("✔️ Vip Routes Loaded");
} catch (error) {
    console.error("❌ Error loading vipRoutes:", error.message);
}

try {
    referralRoutes = require("./routes/referralRoutes");
    console.log("✔️ Referral Routes Loaded");
} catch (error) {
    console.error("❌ Error loading referralRoutes:", error.message);
}

try {
    historyRoutes = require("./routes/historyRoutes");
    console.log("✔️ History Routes Loaded");
} catch (error) {
    console.error("❌ Error loading historyRoutes:", error.message);
}

// Debugging: Check if any route is returning an object instead of a function
console.log("Auth Routes:", authRoutes);
console.log("User Routes:", userRoutes);
console.log("Transaction Routes:", transactionRoutes);
console.log("Booking Routes:", bookingRoutes);
console.log("Review Routes:", reviewRoutes);
console.log("Password Routes:", passwordRoutes);
console.log("Customer Service Routes:", customerServiceRoutes);
console.log("VIP Routes:", vipRoutes);
console.log("Referral Routes:", referralRoutes);
console.log("History Routes:", historyRoutes);

// Apply Routes (Only if they are defined)
if (authRoutes) app.use("/api/auth", authRoutes);
if (userRoutes) app.use("/api/users", userRoutes);
if (transactionRoutes) app.use("/api/transactions", transactionRoutes);
if (bookingRoutes) app.use("/api/bookings", bookingRoutes);
if (reviewRoutes) app.use("/api/reviews", reviewRoutes);
if (passwordRoutes) app.use("/api/password", passwordRoutes);
if (customerServiceRoutes) app.use("/api/customer-service", customerServiceRoutes);
if (vipRoutes) app.use("/api/vip", vipRoutes);
if (referralRoutes) app.use("/api/referrals", referralRoutes);
if (historyRoutes) app.use("/api/history", historyRoutes);

// Default Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
