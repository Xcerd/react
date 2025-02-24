const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const router = express.Router();

// ✅ User Registration
router.post("/register", async (req, res) => {
    const { username, email, password, referrer_id } = req.body;

    try {
        // ✅ Validate Input
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // ✅ Check if user exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE username = $1 OR email = $2",
            [username, email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Username or Email already exists." });
        }

        // ✅ Validate referral code
        let validReferrer = null;
        if (referrer_id) {
            const referrer = await pool.query("SELECT id FROM users WHERE id = $1", [referrer_id]);
            if (referrer.rows.length === 0) {
                return res.status(400).json({ error: "Invalid referral code." });
            }
            validReferrer = referrer_id;
        }

        // ✅ Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Insert New User
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password, referrer_id, vip_level, balance, commission) VALUES ($1, $2, $3, $4, 1, 0, 0) RETURNING *",
            [username, email, hashedPassword, validReferrer]
        );

        // ✅ Generate JWT Token
        const { id } = newUser.rows[0];
        const token = jwt.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ message: "User registered successfully", token, user: newUser.rows[0] });

    } catch (err) {
        console.error("❌ Registration Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ User Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // ✅ Validate Input
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // ✅ Check User Exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // ✅ Validate Password
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // ✅ Generate JWT Token
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "Missing JWT Secret" });
        }

        const { id, username } = user.rows[0];
        const token = jwt.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, user: user.rows[0] });

    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
