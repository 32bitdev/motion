const { Users, ObjectId, Rooms } = require("../collections/mongoCollections");
const { randomUUID } = require("crypto");

//room create request handler
module.exports.createRoom = async (req, res, next) => {
    try {
        const roomId = randomUUID();
        const { _id } = req.body;
        const room = await Rooms.findOne({ roomId: roomId });
        if (room)
            return res.status(500).json({ status: false, msg: "Room already exist" });
        const user = await Users.findOne({ _id: new ObjectId(_id) });
        if (!(user))
            return res.status(500).json({ status: false, msg: "User does not exist" });
        const roomAdd = await Rooms.insertOne({createdAt: new Date(), owner: _id, roomId: roomId, members: [_id], membersNames: [user.username], banMembers: [] });
        if (!roomAdd.acknowledged)
            return res.status(500).json({ status: false, msg: "Something went wrong" });
        const roomDetails = await Rooms.findOne({ roomId: roomId });
        return res.status(200).json({ status: true, roomDetails: roomDetails });
    }
    catch (ex) {
        next(ex);
    }
};