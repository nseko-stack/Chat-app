const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const User = require('../models/user');

// Create a new conversation
const createConversation = async (req, res) => {
    try {
        const currentUserId = req.user; // Get the current user ID from the request (set by authMiddleware)
        const { userId } = req.body; // Get the participant ID from the request body

        //check  that userid was provided
        if(!userId) {
            return res.status(400).json({
                message: "Please provide a userId"
            });
        }

        //check that userid is a valid MongoDB ObjectId
        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid userId"
            });
        }

        // prevent user from creating a conversation with themselves
        if(currentUserId.toString() === userId.toString()) {
            return res.status(400).json({
                message: "You cannot create a conversation with yourself"
            });

        }

        // check if the participant exists
        const participant = await User.findById(userId);

        if(!participant) {
            return res.status(404).json({
                message: "Participant not found"
            });
        }

        // check if conversation already exists
        let existingConversation = await Conversation.findOne({
            participants: { $all: [currentUserId, userId] }
        });

        // if it doesn't exist, create a new conversation
        if(!existingConversation) {
            const newConversation = new Conversation({
                participants: [currentUserId, userId]
            });
            await newConversation.save();
            existingConversation = newConversation;
        }

        // return conversation with user information
        const conversation = await Conversation.findOne(
            { _id: existingConversation._id }
        ).populate('participants', 'username email avatar isOnline lastSeen');

        res.status(201).json({
            message: "Conversation created successfully",
            conversation
        });
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Get all conversations for the current user
const getConversations = async (req, res) => {
    try {
        const currentUserId = req.user; // Get the current user ID from the request (set by authMiddleware)

        // Find all conversations where the current user is a participant, sorted by recent activity
        const conversations = await Conversation.find({
            participants: currentUserId
        })
            .sort({ updatedAt: -1 })
            .populate('participants', 'username email avatar isOnline lastSeen');

        res.status(200).json({
            message: "Conversations retrieved successfully",
            conversations
        });
    } catch (error) {
        console.error("Error retrieving conversations:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createConversation,
    getConversations
};