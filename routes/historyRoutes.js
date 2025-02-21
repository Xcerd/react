const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get booking history
router.get("/bookings/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
        const bookings = await pool.query(
            "SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC",
            [user_id]
        );
        res.json(bookings.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get transaction history
router.get("/transactions/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
        const transactions = await pool.query(
            "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC",
            [user_id]
        );
        res.json(transactions.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
