import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  // Join room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Editor changes
  socket.on("editorChange", ({ roomId, content }) => {
    socket.to(roomId).emit("updateEditor", content);
  });

  // ✅ New: Comment received
  socket.on("sendComment", ({ roomId, comment }) => {
    io.to(roomId).emit("newComment", comment);
    console.log(`Comment received in room ${roomId}:`, comment);
  });

  // Listen for roomDeleted event
  socket.on('roomDeleted', () => {
    console.log("hey i am working");
    
    alert('This room has been deleted. You will be redirected.');
    router.push('/dashboard/rooms');
  });

  // In your socket.io server
  socket.on('deleteRoom', (roomId) => {
    console.log("Room is deleting");
    
    io.to(roomId).emit('roomDeleted');
  });



  // Disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

server.listen(4200, () => console.log("Server Started"));
