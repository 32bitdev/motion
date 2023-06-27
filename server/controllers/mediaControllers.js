const { Users, Metadata, ObjectId } = require("../collections/mongoCollections");
const path = require("path");
const fs = require("fs");

//upload request handler
module.exports.upload = async (req, res, next) => {
    try {
        if (req.files === null)
            return res.status(400).json({ status: false, msg: "No file selected" });
        const file = await req.files.file;
        console.log(file.name);
        const fileType = await file.mimetype;
        console.log(file.mimetype);
        const title = await req.body.title;
        const description = await req.body.description;
        const _id = await req.body._id;
        if (!(fileType === "video/mp4") || !(path.extname(`${file.name}`) === ".mp4"))
            return res.status(400).json({ status: false, msg: "File type is not supported" });
        if (title === "")
            return res.status(400).json({ status: false, msg: "Title or Description cannot be blank" });
        if (description === "")
            return res.status(400).json({ status: false, msg: "Title or Description cannot be blank" });
        if (title.indexOf(" ") === 0)
            return res.status(400).json({ status: false, msg: "Title cannot start with space" });
        if (description.indexOf(" ") === 0)
            return res.status(400).json({ status: false, msg: "Description cannot start with space" });
        const user = await Users.findOne({ _id: new ObjectId(_id) });
        if (!(user))
            return res.status(500).json({ status: false, msg: "User not found" });
        let newMediaCount = user.mediaCount + 1;
        const videoId = user._id + newMediaCount;
        file.name = videoId;
        console.log(file.name);
        file.mv(`${path.join(__dirname, `..`, `..`, `database`, `${file.name}.mp4`)}`, async (err) => {
            if (err) {
                return res.status(500).json({ status: false, msg: "Something went wrong" });
            }
            return res.status(200).json({ status: true, msg: "Upload successfull", videoId: videoId });
        });
    }
    catch (ex) {
        next(ex);
    }
};
