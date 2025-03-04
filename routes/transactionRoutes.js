const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

// ✅ Fetch user transactions
router.get("/", protect, async (req, res) => {
    try {
        const transactions = await db.query("SELECT * FROM transactions WHERE user_id = $1", [req.user.id]);
        res.json(transactions.rows);
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        res.status(500).json({ error: "Error fetching transactions" });
    }
});

// ✅ Request a withdrawal
router.post("/withdraw", protect, async (req, res) => {
    const { amount, withdrawalMethod } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid withdrawal amount" });

    try {
        // ✅ Check User Balance Before Withdrawal
        const userBalance = await db.query("SELECT balance FROM users WHERE id = $1", [req.user.id]);
        if (userBalance.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        let balance = parseFloat(userBalance.rows[0].balance);
        if (isNaN(balance) || balance < amount) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // ✅ Deduct balance immediately (Hold Funds)
        await db.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [amount, req.user.id]);

        // ✅ Insert into Withdrawals Table
        await db.query(
            "INSERT INTO withdrawals (user_id, amount, withdrawal_method, status) VALUES ($1, $2, $3, 'pending')",
            [req.user.id, amount, withdrawalMethod]
        );

        res.json({ message: "Withdrawal request submitted. Funds are held until approval." });
    } catch (error) {
        console.error("❌ Error processing withdrawal request:", error);
        res.status(500).json({ error: "Error processing withdrawal request" });
    }
});

// ✅ Fetch Transaction History for a User
router.get("/user/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Ensure the user exists before fetching transactions
        const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Fetch Transactions
        const transactions = await db.query(
            "SELECT id, user_id, type, amount, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC",
            [id]
        );

        res.json(transactions.rows);
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
