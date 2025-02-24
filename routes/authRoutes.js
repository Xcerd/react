const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// ✅ Function to Generate Unique Referral Code
const generateReferralCode = async () => {
    let code;
    let exists = true;
    while (exists) {
        code = Math.random().toString(36).substr(2, 8).toUpperCase(); // Generate 8-character referral code
        const check = await pool.query("SELECT id FROM users WHERE referral_code = $1", [code]);
        if (check.rows.length === 0) exists = false;
    }
    return code;
};

// ✅ Function to Generate JWT Tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, username: user.username, isAdmin: user.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
};

// ✅ User Registration
router.post(
    "/register",
    [
        body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
        body("email").isEmail().withMessage("Invalid email format"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, email, password, referred_by } = req.body;

        try {
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
            if (referred_by) {
                const referrer = await pool.query("SELECT id FROM users WHERE referral_code = $1", [referred_by]);
                if (referrer.rows.length === 0) {
                    return res.status(400).json({ error: "Invalid referral code." });
                }
                validReferrer = referrer.rows[0].id;
            }

            // ✅ Generate Unique Referral Code
            const referralCode = await generateReferralCode();

            // ✅ Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // ✅ Insert New User
            const newUser = await pool.query(
                "INSERT INTO users (username, email, password, referred_by, referral_code, vip_level, reputation) VALUES ($1, $2, $3, $4, $5, 1, 100) RETURNING *",
                [username, email, hashedPassword, validReferrer, referralCode]
            );

            // ✅ Generate Tokens
            const tokens = generateTokens(newUser.rows[0]);

            res.status(201).json({
                message: "User registered successfully",
                ...tokens,
                user: newUser.rows[0],
            });
        } catch (err) {
            console.error("❌ Registration Error:", err);
            res.status(500).json({ error: "Server error" });
        }
    }
);

// ✅ User Login
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
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

            // ✅ Generate Tokens
            const tokens = generateTokens(user.rows[0]);

            res.json({
                message: "Login successful",
                ...tokens,
                user: user.rows[0],
            });
        } catch (err) {
            console.error("❌ Login Error:", err);
            res.status(500).json({ error: "Server error" });
        }
    }
);

// ✅ Refresh Token Route
router.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(403).json({ error: "Access Denied" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);

        if (!userRes.rows[0]) return res.status(403).json({ error: "Invalid Token" });

        const tokens = generateTokens(userRes.rows[0]);
        res.json(tokens);
    } catch (error) {
        res.status(403).json({ error: "Invalid or Expired Token" });
    }
});

module.exports = router;
