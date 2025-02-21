const db = require("../config/db");

exports.createBooking = async (req, res) => {
    try {
        const { service_name } = req.body;
        const userId = req.user.id;

        const newBooking = await db.query(
            "INSERT INTO bookings (user_id, service_name, status) VALUES ($1, $2, 'pending') RETURNING *",
            [userId, service_name]
        );

        res.status(201).json({ message: "Booking created successfully", booking: newBooking.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Error creating booking", error });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await db.query("SELECT * FROM bookings WHERE user_id = $1", [userId]);
        res.json(bookings.rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings", error });
    }
};
