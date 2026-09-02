const bcrypt = require('bcryptjs');
const userModel = require('../models/user');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
         // check required fields

         if(!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            });
    }

    // check if user already exists
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            message: "Email already exists"
        });
    }

    //check if username already exists
    const existingUsername = await userModel.findOne({ username });

    if (existingUsername) {
        return res.status(400).json({
            message: "Username already exists"
        });
    }


    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new userModel({
        username,
        email,
        password: hashedPassword
    });

    // send response
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
    });
    }
    catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        // find user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // compare password
        const isMatch = await bcrypt.compare(
            password, 
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }
        // generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // send response
        res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error logging in user:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    register,
    login
};