const db = require("../config/db");

exports.createBooking = async (userId, serviceName) => {
    return db.query(
        "INSERT INTO bookings (user_id, service_name, status) VALUES ($1, $2, 'pending') RETURNING *",
        [userId, serviceName]
    );
};

exports.getUserBookings = async (userId) => {
    return db.query("SELECT * FROM bookings WHERE user_id = $1", [userId]);
};
