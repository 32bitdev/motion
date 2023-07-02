//server routes to handle get and post requests
const { createRoom, joinRoom } = require("../controllers/roomControllers");
const router = require("express").Router();
router.post("/createRoom", createRoom);
router.post("/joinRoom", joinRoom);
module.exports = router;