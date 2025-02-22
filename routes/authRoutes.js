const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../server");

const router = express.Router();

// ✅ User Registration
router.post("/register", async (req, res) => {
    const { username, email, password, referrer_id } = req.body;

    try {
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Username or Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            "INSERT INTO users (username, email, password, referrer_id, vip_level, balance, commission) VALUES ($1, $2, $3, $4, 1, 0, 0) RETURNING *",
            [username, email, hashedPassword, referrer_id || null]
        );

        const token = jwt.sign({ id: newUser.rows[0].id, username }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({ message: "User registered successfully", token, user: newUser.rows[0] });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.rows[0].id, username: user.rows[0].username }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({ token, user: user.rows[0] });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
