const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

// ✅ Submit a support ticket
router.post("/submit", protect, async (req, res) => {
    const { subject, message } = req.body;
    try {
        await db.query(
            "INSERT INTO support_tickets (user_id, subject, message, status) VALUES ($1, $2, $3, 'open')",
            [req.user.id, subject, message]
        );
        res.json({ message: "Support ticket submitted" });
    } catch (error) {
        res.status(500).json({ error: "Error submitting support ticket" });
    }
});

// ✅ Get user's support tickets
router.get("/", protect, async (req, res) => {
    try {
        const tickets = await db.query("SELECT * FROM support_tickets WHERE user_id = $1", [req.user.id]);
        res.json(tickets.rows);
    } catch (error) {
        res.status(500).json({ error: "Error fetching support tickets" });
    }
});

module.exports = router;
