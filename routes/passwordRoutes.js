const express = require("express");
const { pool } = require("../config/db");
const router = express.Router();

// ✅ Request Password Reset (Generate Reset Token)
router.post("/request-reset", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const resetToken = Math.random().toString(36).substr(2, 10); // Simple reset token
        await pool.query("UPDATE users SET password = $1 WHERE email = $2", [resetToken, email]);

        // Send resetToken via email (use a mailer service in production)
        console.log(`Password Reset Token for ${email}: ${resetToken}`);

        res.json({ message: "Password reset token generated. Check your email.", token: resetToken });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Reset Password (Now Stores Plain Text Password)
router.post("/reset", async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate reset token
        if (token !== user.rows[0].password) {
            return res.status(400).json({ error: "Invalid reset token" });
        }

        // ✅ Store password in plain text (⚠️ Not secure for production)
        await pool.query("UPDATE users SET password = $1 WHERE email = $2", [newPassword, email]);

        res.json({ message: "Password has been reset successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
