const db = require("../config/db");

exports.createTransaction = async (userId, type, amount) => {
    return db.query(
        "INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, $2, $3, 'pending') RETURNING *",
        [userId, type, amount]
    );
};

exports.getUserTransactions = async (userId) => {
    return db.query("SELECT * FROM transactions WHERE user_id = $1", [userId]);
};
