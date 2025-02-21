const db = require("../config/db");

exports.getUserById = async (userId) => {
    const user = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    return user.rows[0];
};
