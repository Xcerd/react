const db = require("../config/db");

exports.getVipLevel = async (req, res) => {
    try {
        const userId = req.user.id;
        const vip = await db.query("SELECT vip_level FROM users WHERE id = $1", [userId]);
        res.json({ vip_level: vip.rows[0].vip_level });
    } catch (error) {
        res.status(500).json({ message: "Error fetching VIP level", error });
    }
};
