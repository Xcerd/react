const express = require("express");
const { pool } = require("../server");
const router = express.Router();

// ✅ Register with a Referral Code
router.post("/register", async (req, res) => {
    const { username, email, password, referrer_id } = req.body;

    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Username or Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            "INSERT INTO users (username, email, password, referrer_id, vip_level, balance, commission) VALUES ($1, $2, $3, $4, 1, 0, 0) RETURNING *",
            [username, email, hashedPassword, referrer_id || null]
        );

        if (referrer_id) {
            await pool.query("UPDATE users SET commission = commission + 20 WHERE id = $1", [referrer_id]);
        }

        res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get Referral Earnings
router.get("/earnings/:user_id", async (req, res) => {
    try {
        const earnings = await pool.query("SELECT commission FROM users WHERE id = $1", [req.params.user_id]);
        res.json(earnings.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
