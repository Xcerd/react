const express = require("express");
const { pool } = require("../server");
const router = express.Router();

// ✅ Get User's Booking History
router.get("/bookings/:user_id", async (req, res) => {
    try {
        const bookings = await pool.query("SELECT * FROM bookings WHERE user_id = $1", [req.params.user_id]);
        res.json(bookings.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User's Transaction History
router.get("/transactions/:user_id", async (req, res) => {
    try {
        const transactions = await pool.query("SELECT * FROM transactions WHERE user_id = $1", [req.params.user_id]);
        res.json(transactions.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
