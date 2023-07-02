//server routes to handle get and post requests
const { createRoom } = require("../controllers/roomControllers");
const router = require("express").Router();
router.post("/createRoom", createRoom);
module.exports = router;