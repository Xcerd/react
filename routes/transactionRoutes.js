const express = require("express");
const pool = require("../config/db"); // Ensure correct DB connection
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware"); // Ensure user is authenticated

// ✅ Create a Transaction
router.post("/create", async (req, res) => {
    const { user_id, type, amount } = req.body;
    try {
        const transaction = await pool.query(
            "INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, $2, $3, 'pending') RETURNING *",
            [user_id, type, amount]
        );
        res.json(transaction.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Transactions
router.get("/user/:user_id", async (req, res) => {
    try {
        const transactions = await pool.query("SELECT * FROM transactions WHERE user_id = $1", [req.params.user_id]);
        res.json(transactions.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Withdraw Funds
router.post("/withdraw", authenticateToken, async (req, res) => {
    const { user_id, amount, pin } = req.body;

    try {
        // Check if user exists
        const user = await pool.query("SELECT balance, withdrawal_pin FROM users WHERE id = $1", [user_id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if PIN matches
        if (user.rows[0].withdrawal_pin !== pin) {
            return res.status(400).json({ message: "Invalid withdrawal PIN" });
        }

        // Check if user has sufficient balance
        if (user.rows[0].balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Deduct balance
        await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [amount, user_id]);

        // Insert withdrawal record
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
