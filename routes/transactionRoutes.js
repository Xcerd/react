const express = require("express");
const pool = require("../config/db"); 
const { protect } = require("../middleware/authMiddleware"); 

const router = express.Router();

// ✅ Create a Transaction
router.post("/create", protect, async (req, res) => {
    try {
        const { user_id, type, amount } = req.body;

        if (!user_id || !type || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const transaction = await pool.query(
            "INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, $2, $3, 'pending') RETURNING *",
            [user_id, type, amount]
        );

        res.status(201).json(transaction.rows[0]);
    } catch (err) {
        console.error("Error creating transaction:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Transactions
router.get("/user/:user_id", protect, async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const transactions = await pool.query("SELECT * FROM transactions WHERE user_id = $1", [user_id]);

        if (transactions.rows.length === 0) {
            return res.status(404).json({ error: "No transactions found" });
        }

        res.json(transactions.rows);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Withdraw Funds
router.post("/withdraw", protect, async (req, res) => {
    try {
        const { user_id, amount, pin } = req.body;

        if (!user_id || !amount || !pin) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const user = await pool.query("SELECT balance, withdrawal_pin FROM users WHERE id = $1", [user_id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.rows[0].withdrawal_pin !== pin) {
            return res.status(400).json({ message: "Invalid withdrawal PIN" });
        }

        if (user.rows[0].balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [amount, user_id]);

        await pool.query(
            "INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, 'withdrawal', $2, 'completed')",
            [user_id, amount]
        );

        res.json({ message: "Withdrawal successful" });
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
