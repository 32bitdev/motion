const express = require("express");
const fs = require("fs");
const path = require("path");
const socket = require("socket.io");
const fileUpload = require("express-fileupload");
const { Users, Rooms } = require("./collections/mongoCollections");
const userRoutes = require("./routes/userRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const roomRoutes = require("./routes/roomRoutes");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();

!fs.existsSync(`${path.join(__dirname, `..`, `database`)}`) ? fs.mkdirSync(`${path.join(__dirname, `..`, `database`)}`) : null;
!fs.existsSync(`${path.join(__dirname, `..`, `database`, `thumbnails`)}`) ? fs.mkdirSync(`${path.join(__dirname, `..`, `database`, `thumbnails`)}`) : null;

app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', true);
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});
app.use("/auth", userRoutes);
app.use("/media", mediaRoutes);
app.use("/room", roomRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);

//socket io part
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

global.onlineUsers = new Map();
global.onlineId = new Map();
global.socketIdToRoom = new Map();
global.temporaryUsers = new Map();
global.temporaryUsersId = new Map();
global.roomVideos = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("in-room", async (payload) => {
    onlineUsers.set(`${payload._id}+${payload.roomDetails.roomId}`, socket.id);
    onlineId.set(socket.id, `${payload._id}+${payload.roomDetails.roomId}`);
    socketIdToRoom.set(socket.id, `${payload.roomDetails.owner}+${payload.roomDetails.roomId}`);
    await socket.join(`${payload.roomDetails.owner}+${payload.roomDetails.roomId}`);
    socket.to(`${payload.roomDetails.owner}+${payload.roomDetails.roomId}`).emit(
      "room-update");
  });

  socket.on("send-room-request", async (payload) => {
    temporaryUsers.set(`${payload._id}+${payload.roomDetails.roomId}`, socket.id);
    temporaryUsersId.set(socket.id, `${payload._id}+${payload.roomDetails.roomId}`);
    socket.to(onlineUsers.get(`${payload.roomDetails.owner}+${payload.roomDetails.roomId}`)).emit(
      "recieve-room-request", payload);
  });

  socket.on("approve-room-request", async (payload) => {
    socket.to(temporaryUsers.get(`${payload._id}+${payload.roomDetails.roomId}`)).emit(
      "room-request-approved", payload);
  });

  socket.on("kicked", async (payload) => {
    const user = await Users.findOne({ username: payload.memberName });
    const roomDetails = await Rooms.findOne({ roomId: payload.roomId });
    if (payload.owner === roomDetails.owner && !(payload.owner === user._id.toString())) {
      console.log(onlineUsers.get(`${user._id}+${payload.roomId}`));
      socket.to(onlineUsers.get(`${user._id}+${payload.roomId}`)).emit("leave-room");
    }
  });

  socket.on("banned", async (payload) => {
    const user = await Users.findOne({ username: payload.memberName });
    const roomDetails = await Rooms.findOne({ roomId: payload.roomId });
    if (payload.owner === roomDetails.owner && !(payload.owner === user._id.toString())) {
      await Rooms.updateOne({ roomId: payload.roomId }, { $push: { banMembers: user._id.toString() } });
      socket.to(onlineUsers.get(`${user._id.toString()}+${payload.roomId}`)).emit("leave-room");
    }
  });

  socket.on("disconnect", () => {
    const Id = onlineId.get(socket.id);
    onlineId.delete(socket.id);
    onlineUsers.delete(Id);
    const tempId = temporaryUsersId.get(socket.id);
    temporaryUsersId.delete(socket.id);
    temporaryUsers.delete(tempId);
    socket.to(socketIdToRoom.get(socket.id)).emit(
      "room-update");
    socketIdToRoom.delete(socket.id);
  });

  socket.on("set-video", async (payload) => {
    socket.to(`${payload.owner}+${payload.roomId}`).emit(
      "get-video", { videoId: payload.videoId, presenter: payload._id });
  });

  socket.on("remove-video", async (payload) => {
    socket.to(`${payload.owner}+${payload.roomId}`).emit(
      "get-video", { presenter: payload._id });
  });

  socket.on("seeked", async (payload) => {
    socket.to(`${payload.owner}+${payload.roomId}`).emit(
      "seek", payload.newPosition);
  });

  socket.on("paused", async (payload) => {
    socket.to(`${payload.owner}+${payload.roomId}`).emit(
      "pause");
  });

  socket.on("played", async (payload) => {
    socket.to(`${payload.owner}+${payload.roomId}`).emit(
      "play");
  });
});