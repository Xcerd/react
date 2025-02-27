const { pool } = require("../config/db");

// ✅ Create Booking
const createBooking = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const { service_id } = req.body;
        const userId = req.user.id;

        // ✅ Fetch user details
        const userRes = await pool.query("SELECT daily_bookings, last_booking_date FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        let dailyBookings = userRes.rows[0].daily_bookings;
        const lastBookingDate = userRes.rows[0].last_booking_date;
        const today = new Date().toISOString().split("T")[0]; // Get current date (YYYY-MM-DD)

        // ✅ Reset daily bookings if it's a new day
        if (lastBookingDate !== today) {
            await pool.query("UPDATE users SET daily_bookings = 0, last_booking_date = $1 WHERE id = $2", [today, userId]);
            dailyBookings = 0; // Reset local variable
        }

        // ✅ Check if user exceeded daily booking limit
        if (dailyBookings >= 30) {
            return res.status(403).json({ error: "Booking limit reached for today. Try again tomorrow." });
        }

        // ✅ Fetch service details (Only Active Services)
        const serviceRes = await pool.query(
            "SELECT id, name, price, commission_rate FROM services WHERE id = $1 AND status = 'active'",
            [service_id]
        );

        if (serviceRes.rows.length === 0) {
            return res.status(404).json({ error: "Service not found or is inactive." });
        }

        const service = serviceRes.rows[0];
        const commission = (service.price * service.commission_rate) / 100;

        // ✅ Insert booking
        const newBooking = await pool.query(
            "INSERT INTO bookings (user_id, service_id, service_name, price, commission, status, booking_date) VALUES ($1, $2, $3, $4, $5, 'pending', NOW()) RETURNING id, service_name, price, commission, status, booking_date",
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

// ✅ Get User's Bookings
const getUserBookings = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const userId = req.user.id;
        const bookings = await pool.query(
            "SELECT id, service_name, price, commission, status, booking_date FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC",
            [userId]
        );

        res.json(bookings.rows);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Error fetching bookings", error });
    }
};

// ✅ Export functions properly
module.exports = { createBooking, getUserBookings };