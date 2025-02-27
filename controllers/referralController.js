const db = require("../config/db");

// ✅ Get User's Referrals
exports.getUserReferrals = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const userId = req.user.id;
        const referrals = await db.query(
            "SELECT id, username, email, created_at FROM users WHERE referred_by = $1",
            [userId]
        );

        if (referrals.rows.length === 0) {
            return res.status(404).json({ message: "No referrals found." });
        }

        res.json(referrals.rows);
    } catch (error) {
        console.error("Error fetching referrals:", error);
        res.status(500).json({ message: "Error fetching referrals", error });
    }
};

// ✅ Get User's Referral Bonus
exports.getReferralBonus = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const userId = req.user.id;
        const bonus = await db.query("SELECT commission FROM users WHERE id = $1", [userId]);

        const bonusAmount = bonus.rows.length > 0 ? bonus.rows[0].commission || 0 : 0;

        res.json({ bonus: bonusAmount });
    } catch (error) {
        console.error("Error fetching referral bonus:", error);
        res.status(500).json({ message: "Error fetching referral bonus", error });
    }
};
