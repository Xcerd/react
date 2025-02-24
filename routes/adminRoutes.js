const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect, verifyAdmin } = require("../middleware/authMiddleware");

// ✅ Fetch all users
router.get("/users", protect, verifyAdmin, async (req, res) => {
    try {
        const users = await db.query("SELECT id, username, email, reputation, vip_level FROM users");
        res.json(users.rows);
    } catch (error) {
        res.status(500).json({ error: "Error fetching users" });
    }
});

// ✅ Admin updates user reputation
router.post("/update-reputation", protect, verifyAdmin, async (req, res) => {
    const { userId, reputationChange } = req.body;

    try {
        const userRes = await db.query("SELECT reputation FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

        let newReputation = userRes.rows[0].reputation + reputationChange;
        newReputation = Math.max(0, newReputation);

        await db.query("UPDATE users SET reputation = $1 WHERE id = $2", [newReputation, userId]);

        await db.query(
            "INSERT INTO reputation_history (user_id, change_type, change_amount, new_reputation) VALUES ($1, 'admin_adjustment', $2, $3)",
            [userId, reputationChange, newReputation]
        );

        res.json({ message: "Reputation updated successfully", newReputation });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Approve transaction
router.post("/approve-transaction", protect, verifyAdmin, async (req, res) => {
    const { transactionId } = req.body;
    try {
        await db.query("UPDATE transactions SET status = 'approved' WHERE id = $1", [transactionId]);
        res.json({ message: "Transaction approved" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
