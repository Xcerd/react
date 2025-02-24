const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // ✅ Railway PostgreSQL connection
    ssl: process.env.DATABASE_URL.includes("railway") ? { rejectUnauthorized: false } : false, // ✅ Enable SSL only for Railway
});

// ✅ Test the connection at startup
(async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Successfully connected to PostgreSQL");
        client.release(); // ✅ Release client back to the pool
    } catch (error) {
        console.error("❌ Database Connection Error:", error.message);
        process.exit(1); // Exit the app if DB connection fails
    }
})();

module.exports = pool; // ✅ Export correctly
