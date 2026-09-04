const express = require('express');
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "You accessed protected route",
        userId: req.user
    });

});

module.exports = router;