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

//room join request handler
module.exports.joinRoom = async (req, res, next) => {
    try {
        const { roomId, _id } = req.body;
        const roomDetails = await Rooms.findOne({ roomId: roomId });
        if (!roomDetails)
            return res.status(400).json({ status: false, msg: "Room does not exist" });
        if (_id === roomDetails.owner) {
            if (roomDetails.members.includes(_id))
                return res.status(200).json({ status: true, msg: "Owner is present in room", validation: false, roomDetails: roomDetails });
            else {
                const user = await Users.findOne({ _id: new ObjectId(_id) });
                if (!(user))
                    return res.status(500).json({ status: false, msg: "User does not exist" });
                const update = await Rooms.updateOne({ roomId: roomId }, { $push: { members: _id, membersNames: user.username } });
                if (!update.acknowledged)
                    return res.status(500).json({ status: false, msg: "Something went wrong" });
                const roomDetails = await Rooms.findOne({ roomId: roomId });
                return res.status(200).json({ status: true, msg: "Owner is not present in room", validation: false, roomDetails: roomDetails });
            }
        }
        else {
            if (roomDetails.banMembers.includes(_id))
                return res.status(400).json({ status: false, msg: "User is banned" });
            if (roomDetails.members.includes(_id))
                return res.status(200).json({ status: true, msg: "User is present in room", validation: false, roomDetails: roomDetails });
            else {
                const user = await Users.findOne({ _id: new ObjectId(_id) });
                if (!(user))
                    return res.status(500).json({ status: false, msg: "User does not exist" });
                return res.status(200).json({ status: true, msg: "User is not present in room", validation: true, username: user.username, roomDetails: roomDetails });
            }
        }
    }
    catch (ex) {
        next(ex);
    }
};