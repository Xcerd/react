// ✅ Load Environment Variables
require("dotenv").config();

// ✅ Import Dependencies
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// ✅ Middleware
app.use(cors()); // Enable frontend requests
app.use(bodyParser.json());
app.use(express.json());

// ✅ Debugging: Log what is being imported
console.log("🚀 Loading Routes...");

// ✅ Import Database Connection
const pool = require("./config/db"); // ✅ Ensures database is loaded

// ✅ Import Routes
const routeFiles = [
    { path: "/auth", file: "./routes/authRoutes" },
    { path: "/users", file: "./routes/userRoutes" },
    { path: "/transactions", file: "./routes/transactionRoutes" },
    { path: "/bookings", file: "./routes/bookingRoutes" },
    { path: "/reviews", file: "./routes/reviewRoutes" }, // ✅ Reviews route
    { path: "/password", file: "./routes/passwordRoutes" },
    { path: "/customer-service", file: "./routes/customerServiceRoutes" },
    { path: "/vip", file: "./routes/vipRoutes" }, // ✅ VIP route
    { path: "/referrals", file: "./routes/referralRoutes" },
    { path: "/history", file: "./routes/historyRoutes" },
    { path: "/admin", file: "./routes/adminRoutes" },
    { path: "/wallet", file: "./routes/walletRoutes" }, // ✅ Wallet route
    { path: "/items", file: "./routes/items" } // ✅ Items route (Moved to the correct place)
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
