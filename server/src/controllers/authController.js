const bcrypt = require('bcryptjs');
const userModel = require('../models/user');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email, and password"
            });
        }

        username = username.trim();
        email = email.trim().toLowerCase();

        if (username.length < 3) {
            return res.status(400).json({
                message: "Username must be at least 3 characters long"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        // check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // check if username already exists
        const existingUsername = await userModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                message: "Username already taken"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'pulsechat_secret_fallback',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar || ''
            }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            message: "Server error during registration"
        });
    }
};

const login = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        email = email.trim().toLowerCase();

        // find user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'pulsechat_secret_fallback',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar || ''
            }
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            message: "Server error during login"
        });
    }
};

module.exports = {
    register,
    login
};