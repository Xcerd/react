const db = require("../config/db");

// ✅ Fetch all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.query("SELECT id, username, email, reputation, vip_level, balance, daily_bookings, todays_rewards FROM users");
        res.json(users.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
};

// ✅ Update User Reputation
exports.updateUserReputation = async (req, res) => {
    const { userId, reputationChange } = req.body;
    try {
        const userRes = await db.query("SELECT reputation FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

        let newReputation = Math.max(0, userRes.rows[0].reputation + reputationChange);

        await db.query("UPDATE users SET reputation = $1 WHERE id = $2", [newReputation, userId]);

        await db.query(
            "INSERT INTO reputation_history (user_id, change_type, change_amount, new_reputation) VALUES ($1, 'admin_adjustment', $2, $3)",
            [userId, reputationChange, newReputation]
        );

        res.json({ message: "Reputation updated successfully", newReputation });
    } catch (error) {
        console.error("Error updating reputation:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Approve Transaction
exports.approveTransaction = async (req, res) => {
    const { transactionId } = req.body;
    try {
        const transactionRes = await db.query("UPDATE transactions SET status = 'approved' WHERE id = $1 RETURNING *", [transactionId]);
        if (transactionRes.rowCount === 0) return res.status(404).json({ error: "Transaction not found" });

        res.json({ message: "Transaction approved", transaction: transactionRes.rows[0] });
    } catch (error) {
        console.error("Error approving transaction:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// ✅ Update User's Booking, Rewards, and VIP Level
exports.updateUser = async (req, res) => {
    try {
        const { userId, daily_bookings, todays_rewards, vip_level } = req.body;

        // Check if user exists
        const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ error: "User not found." });

        // Update user data (VIP Level now included)
        await db.query(
            "UPDATE users SET daily_bookings = $1, todays_rewards = $2, vip_level = $3 WHERE id = $4",
            [daily_bookings, todays_rewards, vip_level, userId]
        );

        res.json({ message: "User updated successfully!" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Error updating user data." });
    }
};

// ✅ Update Booking Status
exports.updateBooking = async (req, res) => {
    try {
        const { bookingId, status } = req.body;

        const bookingCheck = await db.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
        if (bookingCheck.rows.length === 0) return res.status(404).json({ error: "Booking not found." });

        await db.query("UPDATE bookings SET status = $1 WHERE id = $2", [status, bookingId]);

        res.json({ message: "Booking updated successfully!" });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ error: "Error updating booking." });
    }
};

// ✅ Reset Daily Bookings
exports.resetDailyBookings = async (req, res) => {
    try {
        const { userId } = req.body;

        const userCheck = await db.query("SELECT id FROM users WHERE id = $1", [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ error: "User not found." });

        await db.query("UPDATE users SET daily_bookings = 0 WHERE id = $1", [userId]);

        res.json({ message: "User's daily booking count has been reset." });
    } catch (error) {
        console.error("Error resetting daily bookings:", error);
        res.status(500).json({ error: "Error resetting daily bookings." });
    }
};

// ✅ Update User Balance
exports.updateUserBalance = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        // Validate amount
        if (!amount || isNaN(amount)) return res.status(400).json({ error: "Invalid amount." });

        // Check if user exists
        const userCheck = await db.query("SELECT balance FROM users WHERE id = $1", [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ error: "User not found." });

        const newBalance = parseFloat(userCheck.rows[0].balance) + parseFloat(amount);

        // Update balance in the database
        await db.query("UPDATE users SET balance = $1 WHERE id = $2", [newBalance, userId]);

        res.json({ message: "User balance updated successfully!", balance: newBalance });
    } catch (error) {
        console.error("Error updating user balance:", error);
        res.status(500).json({ error: "Error updating user balance." });
    }
};
