const express = require("express");
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
});