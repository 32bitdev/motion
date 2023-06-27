//server routes to handle get and post requests
const { upload } = require("../controllers/mediaControllers");
const router = require("express").Router();
router.post("/upload", upload);
module.exports = router;