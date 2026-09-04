const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const sendMessage = async (req, res) => {
    try {
        const userId = req.user;
        const { conversationId, text } = req.body;

        const messageText = text || req.body.content;

        // 1. Validate required fields
        if (!conversationId || !messageText) {
            return res.status(400).json({
                message: "Please provide conversationId and text"
            });
        }

        // 2. Validate conversation ID
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                message: "Invalid conversation ID"
            });
        }

        // 3. Find conversation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        // 4. Check if user belongs to conversation
        const isParticipant = conversation.participants.some(
            participant => participant.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You are not part of this conversation"
            });
        }

        // 5. Create and save message
        const message = new Message({
            conversationId,
            sender: userId,
            text: messageText,
            content: messageText
        });

        await message.save();

        // Update conversation's updatedAt timestamp for sorting
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        // 6. Return created message
        const populatedMessage = await message.populate('sender', 'username avatar email');

        res.status(201).json({
            message: "Message sent successfully",
            data: populatedMessage
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = req.user;
        const { conversationId } = req.params;

        // 1. Validate conversation ID
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                message: "Invalid conversation ID"
            });
        }

        // 2. Find conversation
        const conversation = await Conversation.findById(
            conversationId
        );

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        // 3. Check if user belongs to conversation
        const isParticipant = conversation.participants.some(
            participant =>
                participant.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You are not part of this conversation"
            });
        }

        // 4. Get messages
        const messages = await Message.find({
            conversationId
        })
            .sort({ createdAt: 1 })
            .populate("sender", "username avatar email");

        // 5. Return messages
        res.status(200).json({
            message: "Messages retrieved successfully",
            count: messages.length,
            data: messages
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    sendMessage,
    getMessages
};