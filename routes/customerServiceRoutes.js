const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Submit a Support Ticket
router.post("/", authenticateToken, async (req, res) => {
    const { subject, message } = req.body;
    const userId = req.user.id;

    try {
        await db.query("INSERT INTO customer_tickets (user_id, subject, message) VALUES ($1, $2, $3)", 
                       [userId, subject, message]);

        res.json({ message: "Support ticket submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Get User Tickets
router.get("/", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const tickets = await db.query("SELECT * FROM customer_tickets WHERE user_id = $1", [userId]);
        res.json(tickets.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
