const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect, verifyAdmin } = require("../middleware/authMiddleware");

// ✅ Fetch all users
router.get("/users", protect, verifyAdmin, async (req, res) => {
    try {
        const users = await db.query("SELECT id, username, email, reputation, vip_level, daily_bookings, todays_rewards FROM users");
        res.json(users.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
});

// ✅ Admin updates user reputation
router.post("/update-reputation", protect, verifyAdmin, async (req, res) => {
    const { userId, reputationChange } = req.body;

    try {
        // Check if user exists
        const userRes = await db.query("SELECT reputation FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

        // Calculate new reputation
        let newReputation = userRes.rows[0].reputation + reputationChange;
        newReputation = Math.max(0, newReputation);

        // Update user reputation
        await db.query("UPDATE users SET reputation = $1 WHERE id = $2", [newReputation, userId]);

        // Log reputation change
        await db.query(
            "INSERT INTO reputation_history (user_id, change_type, change_amount, new_reputation) VALUES ($1, 'admin_adjustment', $2, $3)",
            [userId, reputationChange, newReputation]
        );

        res.json({ message: "Reputation updated successfully", newReputation });
    } catch (error) {
        console.error("Error updating reputation:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Approve transaction
router.post("/approve-transaction", protect, verifyAdmin, async (req, res) => {
    const { transactionId } = req.body;
    try {
        const transactionRes = await db.query("UPDATE transactions SET status = 'approved' WHERE id = $1 RETURNING *", [transactionId]);
        if (transactionRes.rowCount === 0) return res.status(404).json({ error: "Transaction not found" });

        res.json({ message: "Transaction approved", transaction: transactionRes.rows[0] });
    } catch (error) {
        console.error("Error approving transaction:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Admin updates user bookings, rewards, and limits
router.put("/update-user", protect, verifyAdmin, async (req, res) => {
    try {
        const { userId, daily_bookings, todays_rewards } = req.body;

        // Check if user exists
        const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ error: "User not found." });

        // Update user data
        await db.query(
            "UPDATE users SET daily_bookings = $1, todays_rewards = $2 WHERE id = $3",
            [daily_bookings, todays_rewards, userId]
        );

        res.json({ message: "User updated successfully!" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Error updating user data." });
    }
});

// ✅ Admin modifies bookings (change status, delete booking)
router.put("/update-booking", protect, verifyAdmin, async (req, res) => {
    try {
        const { bookingId, status } = req.body;

        // Check if booking exists
        const bookingCheck = await db.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
        if (bookingCheck.rows.length === 0) return res.status(404).json({ error: "Booking not found." });

        // Update booking status
        await db.query("UPDATE bookings SET status = $1 WHERE id = $2", [status, bookingId]);

        res.json({ message: "Booking updated successfully!" });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ error: "Error updating booking." });
    }
});

// ✅ Admin resets user's daily booking limit
router.put("/reset-daily-bookings", protect, verifyAdmin, async (req, res) => {
    try {
        const { userId } = req.body;

        // Check if user exists
        const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ error: "User not found." });

        // Reset daily bookings
        await db.query("UPDATE users SET daily_bookings = 0 WHERE id = $1", [userId]);

        res.json({ message: "User's daily booking count has been reset." });
    } catch (error) {
        console.error("Error resetting daily bookings:", error);
        res.status(500).json({ error: "Error resetting daily bookings." });
    }
});

module.exports = router;
