//server routes to handle get and post requests
const { upload, getDetails, changeVisibility, getThumbs, download } = require("../controllers/mediaControllers");
const router = require("express").Router();
router.post("/upload", upload);
router.post("/getDetails", getDetails);
router.post("/changeVisibility", changeVisibility);
router.post("/download", download);
router.get("/getThumbs/:videoId", getThumbs);
module.exports = router;