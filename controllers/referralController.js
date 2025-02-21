const db = require("../config/db");

exports.getUserReferrals = async (req, res) => {
    try {
        const userId = req.user.id;
        const referrals = await db.query("SELECT * FROM users WHERE referrer_id = $1", [userId]);
        res.json(referrals.rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching referrals", error });
    }
};

exports.getReferralBonus = async (req, res) => {
    try {
        const userId = req.user.id;
        const bonus = await db.query("SELECT commission FROM users WHERE id = $1", [userId]);
        res.json({ bonus: bonus.rows[0].commission });
    } catch (error) {
        res.status(500).json({ message: "Error fetching referral bonus", error });
    }
};
