const db = require("../config/db");

// Get User Balance
const getUserBalance = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query("SELECT balance FROM users WHERE id = $1", [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ balance: result.rows[0].balance });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving balance", error });
    }
};

// Get Recent Bookings
const getRecentBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            "SELECT * FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC LIMIT 5",
            [userId]
        );

        res.json({ bookings: result.rows });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving bookings", error });
    }
};

// ✅ Ensure correct export
module.exports = {
    getUserBalance,
    getRecentBookings
};
