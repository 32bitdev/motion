//mongodb collections configuration
require("dotenv").config();
const { ObjectId, MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL);
const db = client.db("motion");
client.connect();
const Users = db.collection("users");
const Metadata = db.collection("metaDatas");
const Rooms = db.collection("rooms");
Rooms.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });
const Streams = db.collection("streams");
Streams.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });
module.exports = { Users, Metadata, Rooms, Streams, ObjectId };