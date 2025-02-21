const db = require("../config/db");

exports.createTicket = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = req.user.id;

        const newTicket = await db.query(
            "INSERT INTO customer_tickets (user_id, subject, message, status) VALUES ($1, $2, $3, 'open') RETURNING *",
            [userId, subject, message]
        );

        res.status(201).json({ message: "Support ticket created successfully", ticket: newTicket.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Error creating ticket", error });
    }
};

exports.getUserTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await db.query("SELECT * FROM customer_tickets WHERE user_id = $1", [userId]);
        res.json(tickets.rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tickets", error });
    }
};
