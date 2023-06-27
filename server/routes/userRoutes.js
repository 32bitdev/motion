//server routes to handle get and post requests
const { register, login, logout } = require("../controllers/userControllers");
const router = require("express").Router();
router.post("/register", register);
router.post("/login", login);
router.get("/logout/:id", logout);
module.exports = router;