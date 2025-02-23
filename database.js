const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // ✅ Railway uses full connection strings
    ssl: {
        rejectUnauthorized: false, // ✅ Needed for Railway PostgreSQL
    },
});

pool.on("connect", () => {
    console.log("✅ Connected to PostgreSQL Database");
});

pool.on("error", (err) => {
    console.error("❌ Database Connection Error:", err.message);
});

module.exports = { pool };
