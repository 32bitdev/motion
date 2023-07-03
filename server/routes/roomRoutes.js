//server routes to handle get and post requests
const { createRoom, joinRoom, roomDetails } = require("../controllers/roomControllers");
const router = require("express").Router();
router.post("/createRoom", createRoom);
router.post("/joinRoom", joinRoom);
router.post("/roomDetails", roomDetails);
module.exports = router;