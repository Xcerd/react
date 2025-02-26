const db = require("../config/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ✅ Generate JWT Tokens (Access & Refresh)
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, username: user.username, isAdmin: user.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
};

// ✅ Generate Unique Referral Code Securely
const generateReferralCode = async () => {
    let code;
    let exists = true;
    while (exists) {
        code = crypto.randomBytes(3).toString("hex").toUpperCase(); // Generates a 6-character referral code
        const check = await db.query("SELECT id FROM users WHERE referral_code = $1", [code]);
        if (check.rows.length === 0) exists = false;
    }
    return code;
};

// ✅ Register User (Supports Referral Codes)
const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, referral_code } = req.body;

        // ✅ Check if user already exists
        const existingUser = await db.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username or email already taken" });
        }

        // ✅ Validate Referral Code (If provided)
        let referredBy = null;
        if (referral_code) {
            const referrer = await db.query("SELECT id FROM users WHERE referral_code = $1", [referral_code]);
            if (referrer.rows.length === 0) {
                return res.status(400).json({ message: "Invalid referral code" });
            }
            referredBy = referrer.rows[0].id;
        }

        // ✅ Generate Unique Referral Code
        const newReferralCode = await generateReferralCode();

        // ✅ Insert New User
        const newUser = await db.query(
            "INSERT INTO users (name, username, email, password, referred_by, referral_code, vip_level, reputation, balance, is_admin, is_suspended) VALUES ($1, $2, $3, $4, $5, $6, 1, 100, 0.00, false, false) RETURNING *",
            [name, username, email, password, referredBy, referral_code]
        );

        // ✅ Generate Tokens
        const tokens = generateTokens(newUser.rows[0]);

        res.status(201).json({
            message: "User registered successfully",
            ...tokens,
            user: newUser.rows[0],
        });

    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Login User (Uses `username` Instead of `email`)
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // ✅ Find user by username
        const userRes = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const user = userRes.rows[0];

        // ✅ Directly Compare Plain Text Password
        if (password !== user.password) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // ✅ Generate JWT Tokens
        const tokens = generateTokens(user.rows[0]);

        res.json({
            message: "Login successful",
            ...tokens,
            user: user.rows[0],
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Refresh Token Route
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(403).json({ message: "Access Denied" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const userRes = await db.query("SELECT * FROM users WHERE id = $1", [decoded.id]);

        if (!userRes.rows.length) return res.status(403).json({ message: "Invalid Token" });

        // ✅ Generate New Tokens
        const tokens = generateTokens(userRes.rows[0]);

        res.json(tokens);
    } catch (error) {
        res.status(403).json({ message: "Invalid or Expired Token" });
    }
};

// ✅ Log to Ensure Controller is Loaded
console.log("✔️ Auth Controller Loaded");

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
};
