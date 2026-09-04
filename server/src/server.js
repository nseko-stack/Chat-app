const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const User = require("./models/user");
dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const path = require("path");
const fs = require("fs");

const allowedOrigins = process.env.CLIENT_URL 
    ? [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"]
    : "*";

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

// Health check endpoint for deployment platforms
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Serve static frontend build in production if available
const clientDistPath = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get("/{*splat}", (req, res, next) => {
        if (req.url.startsWith("/api") || req.url.startsWith("/socket.io")) {
            return next();
        }
        res.sendFile(path.join(clientDistPath, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.json({
            message: "PulseChat API is running",
            timestamp: new Date().toISOString()
        });
    });
}

// Socket.io Real-time logic
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Setup user connection
    socket.on("setup", async (userData) => {
        if (!userData || !userData.id && !userData._id) return;
        const userId = userData.id || userData._id;
        socket.userId = userId;
        socket.join(userId);
        onlineUsers.set(userId.toString(), socket.id);
        console.log(`User ${userId} connected and joined personal room`);
        
        // Broadcast online users list
        io.emit("online users", Array.from(onlineUsers.keys()));
    });

    // Join specific conversation room
    socket.on("join chat", (room) => {
        if (!room) return;
        socket.join(room);
        console.log(`Socket ${socket.id} joined conversation room: ${room}`);
    });

    // Leave specific conversation room
    socket.on("leave chat", (room) => {
        if (!room) return;
        socket.leave(room);
        console.log(`Socket ${socket.id} left conversation room: ${room}`);
    });

    // Typing indicators
    socket.on("typing", ({ room, user }) => {
        if (!room) return;
        socket.to(room).emit("typing", { room, user });
    });

    socket.on("stop typing", ({ room, user }) => {
        if (!room) return;
        socket.to(room).emit("stop typing", { room, user });
    });

    // Real-time message broadcast
    socket.on("new message", (newMessageReceived) => {
        if (!newMessageReceived) return;
        const conversationId = newMessageReceived.conversationId?._id || newMessageReceived.conversationId;
        if (!conversationId) return;

        // Broadcast to everyone in conversation room except sender
        socket.to(conversationId.toString()).emit("message received", newMessageReceived);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        if (socket.userId) {
            onlineUsers.delete(socket.userId.toString());
            io.emit("online users", Array.from(onlineUsers.keys()));
        }
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();