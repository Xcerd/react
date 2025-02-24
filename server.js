// ✅ Load Environment Variables
require("dotenv").config();

// ✅ Import Dependencies
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Debugging: Log what is being imported
console.log("🚀 Loading Routes...");

// ✅ Import Database Connection
const pool = require("./config/db"); // ✅ Ensures database is loaded

// ✅ Import Routes
const routeFiles = [
    { path: "/api/auth", file: "./routes/authRoutes" },
    { path: "/api/users", file: "./routes/userRoutes" },
    { path: "/api/transactions", file: "./routes/transactionRoutes" },
    { path: "/api/bookings", file: "./routes/bookingRoutes" },
    { path: "/api/reviews", file: "./routes/reviewRoutes" },
    { path: "/api/password", file: "./routes/passwordRoutes" },
    { path: "/api/customer-service", file: "./routes/customerServiceRoutes" },
    { path: "/api/vip", file: "./routes/vipRoutes" },
    { path: "/api/referrals", file: "./routes/referralRoutes" },
    { path: "/api/history", file: "./routes/historyRoutes" },
    { path: "/api/admin", file: "./routes/adminRoutes" },
    { path: "/api/wallet", file: "./routes/walletRoutes" },
    { path: "/api/support", file: "./routes/supportRoutes" }
];

// ✅ Load Routes Dynamically
routeFiles.forEach(({ path, file }) => {
    try {
        const route = require(file);
        app.use(path, route);
        console.log(`✔️ Route Loaded: ${path}`);
    } catch (error) {
        console.error(`❌ Error loading ${file}:`, error.message);
    }
});

// ✅ Default Route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// ✅ Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🚨 Error:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
