const express = require('express');
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");

const router = express.Router();

// Get current user profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "You accessed protected route",
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Search / list all other users
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { search } = req.query;
        let query = { _id: { $ne: req.user } };

        if (search && search.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { username: { $regex: escaped, $options: "i" } },
                { email: { $regex: escaped, $options: "i" } }
            ];
        }

        const users = await User.find(query).select("-password").sort({ username: 1 });
        res.json({
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;