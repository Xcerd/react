const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../server");
const router = express.Router();

// ✅ Request Password Reset (Generate Reset Token)
router.post("/request-reset", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const resetToken = Math.random().toString(36).substr(2, 10); // Generate a simple token (Use JWT or UUID in production)
        await pool.query("UPDATE users SET password = $1 WHERE email = $2", [resetToken, email]);

        // Send resetToken via email (use a mailer service)
        console.log(`Password Reset Token for ${email}: ${resetToken}`);

        res.json({ message: "Password reset token generated. Check your email.", token: resetToken });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Reset Password
router.post("/reset", async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // In production, validate token properly
        if (token !== user.rows[0].password) {
            return res.status(400).json({ error: "Invalid reset token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

        res.json({ message: "Password has been reset successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
