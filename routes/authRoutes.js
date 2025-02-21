const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// Debugging: Check if functions are defined
console.log("Register User:", registerUser);
console.log("Login User:", loginUser);

// Ensure routes are correctly defined
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router; // ✅ Ensure ONLY `router` is exported, not `{ router }`
