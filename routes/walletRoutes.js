const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

// ✅ Get user wallet balance
router.get("/balance", protect, async (req, res) => {
    try {
        const balanceRes = await db.query("SELECT balance FROM wallets WHERE user_id = $1", [req.user.id]);
        res.json({ balance: balanceRes.rows[0]?.balance || 0 });
    } catch (error) {
        res.status(500).json({ error: "Error fetching wallet balance" });
    }
});

// ✅ Deposit funds
router.post("/deposit", protect, async (req, res) => {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    try {
        await db.query("UPDATE wallets SET balance = balance + $1 WHERE user_id = $2", [amount, req.user.id]);
        res.json({ message: "Deposit successful" });
    } catch (error) {
        res.status(500).json({ error: "Error processing deposit" });
    }
});

module.exports = router;
