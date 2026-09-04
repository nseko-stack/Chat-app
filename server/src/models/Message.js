const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        trim: true,
        default: ""
    },

    text: {
        type: String,
        trim: true,
        default: ""
    },

    readBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},
{
    timestamps: true
}
);

messageSchema.pre('save', function () {
    if (this.text && !this.content) {
        this.content = this.text;
    } else if (this.content && !this.text) {
        this.text = this.content;
    }
});

module.exports = mongoose.model("Message", messageSchema);