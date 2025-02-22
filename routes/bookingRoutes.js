const express = require("express");
const { pool } = require("../server");
const router = express.Router();

// ✅ Create a Booking
router.post("/create", async (req, res) => {
    const { user_id, service_name } = req.body;
    try {
        const newBooking = await pool.query(
            "INSERT INTO bookings (user_id, service_name, status) VALUES ($1, $2, 'pending') RETURNING *",
            [user_id, service_name]
        );
        res.json(newBooking.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Bookings
router.get("/user/:user_id", async (req, res) => {
    try {
        const bookings = await pool.query("SELECT * FROM bookings WHERE user_id = $1", [req.params.user_id]);
        res.json(bookings.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
