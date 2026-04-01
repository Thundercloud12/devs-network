import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
  },
  transports: ['websocket', 'polling'],
});

// Track rooms and users
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("joinRoom", (roomId) => {
    try {
      if (!roomId) {
        console.error("Invalid room ID");
        return;
      }

      socket.join(roomId.toString());
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      console.log(`User ${socket.id} joined room ${roomId}`);
      console.log(`Room ${roomId} now has ${rooms.get(roomId).size} users`);

      // Notify others that someone joined
      socket.to(roomId).emit("userJoined", {
        userId: socket.id,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Error joining room:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Editor changes
  socket.on("editorChange", ({ roomId, content }) => {
    try {
      if (!roomId || content === undefined) {
        console.error("Invalid editor change data");
        return;
      }
      socket.to(roomId).emit("updateEditor", content);
    } catch (err) {
      console.error("Error broadcasting editor change:", err);
    }
  });

  // Send comment
  socket.on("sendComment", ({ roomId, comment }) => {
    try {
      if (!roomId || !comment) {
        console.error("Invalid comment data");
        return;
      }
      io.to(roomId).emit("newComment", comment);
      console.log(`Comment in room ${roomId}:`, comment.user);
    } catch (err) {
      console.error("Error sending comment:", err);
    }
  });

  // Delete room
  socket.on("deleteRoom", (roomId) => {
    try {
      console.log(`Room ${roomId} is being deleted`);
      io.to(roomId).emit("roomDeleted", {
        message: "This room has been deleted",
      });
      
      // Clean up room tracking
      if (rooms.has(roomId)) {
        rooms.delete(roomId);
      }
      
      // Leave the room
      socket.leave(roomId);
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  });

  // User left room
  socket.on("userLeft", ({ roomId, userId }) => {
    try {
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
      }
      socket.to(roomId).emit("userDisconnected", {
        userId,
        timestamp: new Date(),
      });
      console.log(`User ${userId} left room ${roomId}`);
    } catch (err) {
      console.error("Error handling user leave:", err);
    }
  });

  // Grant/Revoke editor access
  socket.on("editorAccessChanged", ({ roomId, userId, action }) => {
    try {
      if (!roomId || !userId || !action) {
        console.error("Invalid editor access change data");
        return;
      }
      io.to(roomId).emit("editorAccessUpdated", {
        userId,
        action, // 'grant' or 'revoke'
        timestamp: new Date(),
      });
      console.log(`Editor access ${action}ed for user ${userId} in room ${roomId}`);
    } catch (err) {
      console.error("Error broadcasting editor access change:", err);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    
    // Clean up from all rooms
    for (const [roomId, users] of rooms.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        if (users.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
  });

  // Error handling
  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

const PORT = process.env.PORT || 4200;
server.listen(PORT, () => console.log(`Socket.IO Server running on port ${PORT}`));
