const { Users } = require("../collections/mongoCollections");
const bcrypt = require("bcrypt");

//register post request handler
module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await Users.findOne({ username: username });
        if (usernameCheck)
            return res.status(400).json({ status: false, msg: "Username already used" });
        const emailCheck = await Users.findOne({ email: email });
        if (emailCheck)
            return res.status(400).json({ status: false, msg: "Email already used" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const userAdd = await Users.insertOne({ email: email, username: username, password: hashedPassword, mediaCount: 0 });
        if (!userAdd.acknowledged)
            return res.status(500).json({ status: false, msg: "Something went wrong" });
        const user = await Users.findOne({ username: username });
        delete user.password;
        return res.status(200).json({ status: true, user: user });
    }
    catch (ex) {
        next(ex);
    }
};

// login post request handler
module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ username: username });
        if (!user)
            return res.status(400).json({ status: false, msg: "Incorrect Username or Password" });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(400).json({ status: false, msg: "Incorrect Username or Password" });
        delete user.password;
        return res.status(200).json({ status: true, user: user });
    } catch (ex) {
        next(ex);
    }
};

//logout post request handler
module.exports.logout = (req, res, next) => {
    try {
        if (!req.params.id)
            return res.status(400).json({ status: false, msg: "User id is required" });
        return res.status(200).send();
    } catch (ex) {
        next(ex);
    }
};