const db = require("../config/db");

// ✅ Create Support Ticket
exports.createTicket = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const { subject, message } = req.body;
        const userId = req.user.id;

        const newTicket = await db.query(
            "INSERT INTO customer_tickets (user_id, subject, message, status, created_at) VALUES ($1, $2, $3, 'open', NOW()) RETURNING id, subject, status, created_at",
            [userId, subject, message]
        );

        res.status(201).json({
            message: "Support ticket created successfully",
            ticket: newTicket.rows[0]
        });

    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

// ✅ Fetch User's Tickets
exports.getUserTickets = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const userId = req.user.id;

        const tickets = await db.query(
            "SELECT id, subject, status, created_at FROM customer_tickets WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );

        res.json({ tickets: tickets.rows });

    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};
