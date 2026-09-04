const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({ // Define the schema for the Conversation model
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User model
            ref: 'User',
            required: true
        }
    ]
}, {
    timestamps: true
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
