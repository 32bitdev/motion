//server routes to handle get and post requests
const { createRoom, joinRoom, roomValidation, roomDetails, exitRoom } = require("../controllers/roomControllers");
const router = require("express").Router();
router.post("/createRoom", createRoom);
router.post("/joinRoom", joinRoom);
router.post("/roomValidation", roomValidation);
router.post("/roomDetails", roomDetails);
router.post("/exitRoom", exitRoom);
module.exports = router;