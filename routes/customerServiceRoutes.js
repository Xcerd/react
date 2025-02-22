const express = require("express");
const { pool } = require("../server");
const router = express.Router();

// ✅ Create a Customer Support Ticket
router.post("/create", async (req, res) => {
    const { user_id, subject, message } = req.body;
    try {
        const ticket = await pool.query(
            "INSERT INTO customer_tickets (user_id, subject, message, status) VALUES ($1, $2, $3, 'open') RETURNING *",
            [user_id, subject, message]
        );
        res.json(ticket.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
