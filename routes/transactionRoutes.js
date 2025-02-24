const express = require("express");
const pool = require("../config/db");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// ✅ Create a Transaction
router.post("/create", protect, async (req, res) => {
    try {
        const { type, amount } = req.body;
        const user_id = req.user.id;  // ✅ Get user ID from token

        if (!type || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const transaction = await pool.query(
            "INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, $2, $3, 'pending') RETURNING *",
            [user_id, type, amount]
        );

        res.status(201).json(transaction.rows[0]);

    } catch (err) {
        console.error("❌ Error creating transaction:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Transactions
router.get("/user", protect, async (req, res) => {
    try {
        const transactions = await pool.query(
            "SELECT * FROM transactions WHERE user_id = $1",
            [req.user.id]
        );

        if (transactions.rows.length === 0) {
            return res.status(404).json({ error: "No transactions found" });
        }

        res.json(transactions.rows);
    } catch (err) {
        console.error("❌ Error fetching transactions:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
