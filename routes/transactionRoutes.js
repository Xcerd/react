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
        res.status(500).json({ error: "Error fetching transactions" });
    }
});

// ✅ Request a withdrawal
router.post("/withdraw", protect, async (req, res) => {
    const { amount, withdrawalMethod } = req.body;

    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    try {
        await db.query(
            "INSERT INTO withdrawals (user_id, amount, withdrawal_method, status) VALUES ($1, $2, $3, 'pending')",
            [req.user.id, amount, withdrawalMethod]
        );
        res.json({ message: "Withdrawal request submitted" });
    } catch (error) {
        res.status(500).json({ error: "Error processing withdrawal request" });
    }
});

module.exports = router;
