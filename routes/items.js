const express = require("express");
const router = express.Router();
const { getItems } = require("../controllers/itemController");

// ✅ Route to get all items
router.get("/", getItems);

module.exports = router;
