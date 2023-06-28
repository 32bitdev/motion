//server routes to handle get and post requests
const { upload, getDetails } = require("../controllers/mediaControllers");
const router = require("express").Router();
router.post("/upload", upload);
router.post("/getDetails", getDetails);
module.exports = router;