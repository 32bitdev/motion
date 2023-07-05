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

//room validation request handler
module.exports.roomValidation = async (req, res, next) => {
    try {
        const { roomDetails, _id } = req.body;
        const room = await Rooms.findOne({ roomId: roomDetails.roomId });
        if (!room)
            return res.status(500).json({ status: false, msg: "Room does not exist" });
        if (room.members.includes(_id))
            return res.status(200).json({ status: true, msg: "User already present" });
        else {
            const user = await Users.findOne({ _id: new ObjectId(_id) });
            if (!(user))
                return res.status(500).json({ status: false, msg: "User does not exist" });
            const memberAdd = await Rooms.updateOne({ roomId: roomDetails.roomId }, { $push: { members: _id, membersNames: user.username } });
            if (!memberAdd.acknowledged)
                return res.status(500).json({ status: false, msg: "Something Went Wrong" });
            return res.status(200).json({ status: true, msg: "User added to room" });
        }
    }
    catch (ex) {
        next(ex);
    }
};

//room details request handler
module.exports.roomDetails = async (req, res, next) => {
    try {
        const { roomId, _id } = req.body;
        const roomDetails = await Rooms.findOne({ roomId: roomId });
        if (!roomDetails)
            return res.status(500).json({ status: false, msg: "Room does not exist" });
        if (!roomDetails.members.includes(_id))
            return res.status(500).json({ status: false, msg: "User not allowed" });
        return res.status(200).json({ status: true, roomDetails: roomDetails });
    }
    catch (ex) {
        next(ex);
    }
};

//room media clear request handler
module.exports.roomMediaClear = async (req, res, next) => {
    try {
        const { _id, roomId } = req.body;
        const roomDetails = await Rooms.findOne({ roomId: roomId });
        if (!roomDetails)
            return res.status(500).json({ status: false, msg: "Room does not exist" });
        if (!roomDetails.members.includes(_id))
            return res.status(500).json({ status: false, msg: "User not present" });
        const mediaClear = await Rooms.updateOne({ roomId: roomId }, { $set: { videoId: null } });
        if (!mediaClear.acknowledged)
            return res.status(500).json({ status: false, msg: "Something went wrong" });
        return res.status(200).json({ status: true, msg: "Room media cleared" });
    }
    catch (ex) {
        next(ex);
    }
};

//room exit request handler
module.exports.exitRoom = async (req, res, next) => {
    try {
        const { roomId, _id } = req.body;
        const roomDetails = await Rooms.findOne({ roomId: roomId });
        if (!roomDetails)
            return res.status(500).json({ status: false, msg: "Room does not exist" });
        if (!roomDetails.members.includes(_id))
            return res.status(500).json({ status: false, msg: "User is not in the room" });
        const user = await Users.findOne({ _id: new ObjectId(_id) });
        if (!(user))
            return res.status(500).json({ status: false, msg: "User does not exist" });
        const update = await Rooms.updateOne({ roomId: roomId }, { $pull: { members: _id, membersNames: user.username } });
        if (!update.acknowledged)
            return res.status(500).json({ status: false, msg: "Something went wrong" });
        return res.status(200).json({ status: true, msg: "Room exited" });
    }
    catch (ex) {
        next(ex);
    }
};