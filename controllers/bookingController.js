const { pool } = require("../config/db"); // ✅ Ensure correct DB connection

// ✅ Create Booking
const createBooking = async (req, res) => {
    try {
        const { service_id } = req.body;
        const userId = req.user.id;

        // ✅ Fetch user details
        const userRes = await pool.query("SELECT daily_bookings FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        // ✅ Check if user exceeded daily booking limit
        if (userRes.rows[0].daily_bookings >= 30) {
            return res.status(403).json({ error: "Booking limit reached for today. Try again tomorrow." });
        }

        // ✅ Fetch service details
        const serviceRes = await pool.query("SELECT * FROM services WHERE id = $1", [service_id]);
        if (serviceRes.rows.length === 0) {
            return res.status(404).json({ error: "Service not found." });
        }

        const service = serviceRes.rows[0];
        const commission = (service.price * service.commission_rate) / 100;

        // ✅ Insert booking
        const newBooking = await pool.query(
            "INSERT INTO bookings (user_id, service_id, service_name, price, commission, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *",
            [userId, service.id, service.name, service.price, commission]
        );

        // ✅ Update user's "today's rewards" and increment daily bookings count
        await pool.query(
            "UPDATE users SET todays_rewards = todays_rewards + $1, daily_bookings = daily_bookings + 1 WHERE id = $2",
            [commission, userId]
        );

        res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking.rows[0],
            todays_rewards: commission
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Error creating booking", error });
    }
};

// ✅ Get User Bookings
const getUserBookings = async (req, res) => {
    try {
        const bookings = await pool.query("SELECT * FROM bookings WHERE user_id = $1", [req.params.user_id]);
        res.json(bookings.rows);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Error fetching bookings", error });
    }
};

// ✅ Export functions properly
module.exports = { createBooking, getUserBookings };
