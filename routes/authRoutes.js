const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// ✅ Generate Unique Referral Code
const generateReferralCode = async () => {
    let code;
    let exists = true;
    while (exists) {
        code = Math.random().toString(36).substr(2, 5).toUpperCase(); 
        const check = await pool.query("SELECT id FROM users WHERE referral_code = $1", [code]);
        if (check.rows.length === 0) exists = false;
    }
    return code;
};

// ✅ Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, isAdmin: user.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// ✅ Validation Middleware for Login
const validateLogin = [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").trim().notEmpty().withMessage("Password is required"),
];

// ✅ User Login Route
router.post("/login", validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        // ✅ Check if user exists
        const userRes = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        const user = userRes.rows[0];

        // ✅ Validate Password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // ✅ Generate JWT Token
        const token = generateToken(user);

        res.json({
            message: "Login successful",
            token,
            user,
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ User Registration Route
router.post(
    "/register",
    [
        body("name").trim().notEmpty().withMessage("Full name is required"),
        body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
        body("email").isEmail().withMessage("Invalid email format"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, username, email, password, referred_by } = req.body;

        try {
            // ✅ Check if user already exists
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
                "INSERT INTO users (name, username, email, password, referral_code, referred_by, vip_level, reputation, balance, is_admin, is_suspended) VALUES ($1, $2, $3, $4, $5, $6, 1, 100, 0.00, false, false) RETURNING *",
                [name, username, email, hashedPassword, referralCode, validReferrer]
            );

            res.status(201).json({
                message: "User registered successfully",
                user: newUser.rows[0],
            });
        } catch (err) {
            console.error("❌ Registration Error:", err);
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

        const token = generateToken(userRes.rows[0]);
        res.json({ token });
    } catch (error) {
        res.status(403).json({ error: "Invalid or Expired Token" });
    }
});

module.exports = router;
