const db = require("../config/db");

// ✅ Get User Balance & Today's Rewards
const getUserBalance = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.id;

        // ✅ Fetch Wallet Balance
        const balanceResult = await db.query("SELECT balance FROM users WHERE id = $1", [userId]);

        // ✅ Choose the correct method to calculate "Today's Rewards"
        const rewardsQuery = `
            SELECT COALESCE(SUM(s.price * s.commission_rate / 100), 0) AS todays_rewards 
            FROM bookings b
            JOIN services s ON b.service_name = s.name
            WHERE b.user_id = $1 
            AND DATE(b.booking_date) = CURRENT_DATE
        `;

        const rewardsResult = await db.query(rewardsQuery, [userId]);

        res.json({ 
            balance: balanceResult.rows[0]?.balance || 0, 
            todaysRewards: rewardsResult.rows[0]?.todays_rewards || 0 
        });

    } catch (error) {
        console.error("Error retrieving balance & rewards:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

// ✅ Get Recent Bookings (Only Needed Data)
const getRecentBookings = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.id;

        const result = await db.query(
            "SELECT id, service_name AS item_name, price, commission, booking_date FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC LIMIT 5",
            [userId]
        );

        res.json({ bookings: result.rows });
    } catch (error) {
        console.error("Error retrieving bookings:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

// ✅ Ensure Correct Export
module.exports = {
    getUserBalance,
    getRecentBookings
};
