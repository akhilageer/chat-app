import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import "./config/mongo.js";

import { VerifyToken, VerifySocketToken } from "./middlewares/VerifyToken.js";
import chatRoomRoutes from "./routes/chatRoom.js";
import chatMessageRoutes from "./routes/chatMessage.js";
import userRoutes from "./routes/user.js";
import groupChatRoutes from "./routes/groupchat.js";
import ChatRoom from "./models/ChatRoom.js";

const app = express();
const path  = require('path');

const _dirname = path.dirname("")
const buildPath = path.join(_dirname  , "../client/build");

app.use(express.static(buildPath))

app.get("/*", function(req, res){

    res.sendFile(
        path.join(__dirname, "../client/build/index.html"),
        function (err) {
          if (err) {
            res.status(500).send(err);
          }
        }
      );

})

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(VerifyToken);

const PORT = process.env.PORT || 8080;

app.use("/api/room", chatRoomRoutes);
app.use("/api/message", chatMessageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/group", groupChatRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.use(VerifySocketToken);

global.onlineUsers = new Map();

const getKey = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("getUsers", Array.from(onlineUsers));
    // socket.broadcast.emit('new_useronline',userId)
  });

  socket.on(
    "sendMessage",
    async ({ senderId, senderName, message, id, photo }) => {
      const chatRooms = await ChatRoom.find();
      const targetRoom = chatRooms.find((room) => room._id.toString() === id);
      targetRoom.members.map((member) => {
        const sendUserSocket = onlineUsers.get(member);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("getMessage", {
            chatRoomId: id,
            senderId,
            message,
            photo,
          });
          socket
            .to(sendUserSocket)
            .emit("receive_notification", {
              text: "New message from " + senderName,
              chatRoomId: id,
              senderId,
            });
        }
      });
    }
  );

  socket.on("typing", async ({ senderId, senderEmail, receiverId, id }) => {
    const chatRooms = await ChatRoom.find();
    const targetRoom = chatRooms.find((room) => room._id.toString() === id);
    targetRoom.members.map((member) => {
      const sendUserSocket = onlineUsers.get(member);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("someonetyping", {
          chatRoomId: id,
          senderId,
          senderEmail,
        });
      }
    });
  });

  socket.on("cancle_typing", async ({ senderId, id }) => {
    const chatRooms = await ChatRoom.find();
    const targetRoom = chatRooms.find((room) => room._id.toString() === id);
    targetRoom.members.map((member) => {
      const sendUserSocket = onlineUsers.get(member);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("stoptyping", {
          chatRoomId: id,
          senderId,
        });
      }
    });
  });

  socket.on("RoomCreated", ({ senderId, receiverId }) => {
    socket.broadcast.emit("RoomCreatedFrom", {
      receiverId,
    });
  });

  socket.on("chatchanged", async ({ id, name }) => {
    if (!name) return;
    const chatRoom = await ChatRoom.find({ name: name });
    let members = Array.from(chatRoom[0].members);
    if (members.indexOf(id) < 0) {
      await ChatRoom.updateOne({ name: name }, { members: [...members, id] });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(getKey(onlineUsers, socket.id));
    socket.broadcast.emit("getUsers", Array.from(onlineUsers));
  });
});
