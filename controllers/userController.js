const db = require("../config/db");

exports.getUserBalance = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query("SELECT balance FROM users WHERE id = $1", [userId]);
        res.json({ balance: result.rows[0].balance });
    } catch (error) {
        res.status(500).json({ message: "Error fetching balance", error });
    }
};

exports.getRecentBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query("SELECT id, service_name, status FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5", [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings", error });
    }
};
