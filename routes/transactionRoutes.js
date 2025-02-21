const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Deposit funds
router.post("/deposit", async (req, res) => {
    const { user_id, amount } = req.body;
    try {
        if (amount <= 0) {
            return res.status(400).json({ error: "Invalid deposit amount." });
        }
        
        await pool.query(
            "UPDATE users SET balance = balance + $1 WHERE id = $2",
            [amount, user_id]
        );

        await pool.query(
            "INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, 'deposit', $2, 'completed')",
            [user_id, amount]
        );
        
        res.json({ message: "Deposit successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Withdraw funds
router.post("/withdraw", async (req, res) => {
    const { user_id, amount } = req.body;
    try {
        const user = await pool.query("SELECT balance FROM users WHERE id = $1", [user_id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        
        const balance = user.rows[0].balance;
        if (amount <= 0 || amount > balance) {
            return res.status(400).json({ error: "Invalid withdrawal amount." });
        }

        await pool.query(
            "UPDATE users SET balance = balance - $1 WHERE id = $2",
            [amount, user_id]
        );

        await pool.query(
            "INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, 'withdrawal', $2, 'pending')",
            [user_id, amount]
        );

        res.json({ message: "Withdrawal request submitted. Awaiting approval." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get transaction history
router.get("/history/:user_id", async (req, res) => {
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
