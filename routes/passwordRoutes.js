const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Change Password Route
router.post("/change", authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await db.query("SELECT password FROM users WHERE id = $1", [userId]);

        if (!user.rows.length) {
            return res.status(404).json({ message: "User not found" });
        }

        const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
