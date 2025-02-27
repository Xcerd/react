const db = require("../config/db");

// ✅ Get User Balance & Today's Rewards
const getUserBalance = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.id;

        // ✅ Fetch Balance
        const balanceResult = await db.query("SELECT balance FROM users WHERE id = $1", [userId]);

        // ✅ Fetch Today's Rewards (Sum of commissions earned today)
        const rewardsResult = await db.query(
            "SELECT COALESCE(SUM(commission), 0) AS todays_rewards FROM bookings WHERE user_id = $1 AND DATE(booking_date) = CURRENT_DATE",
            [userId]
        );

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
            "SELECT id, item_name, price, commission, booking_date FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC LIMIT 5",
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
