//mongodb collections configuration
require("dotenv").config();
const { ObjectId, MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL);
const db = client.db("motion");
client.connect();
const Users = db.collection("users");
const Metadata = db.collection("metaDatas");
const Streams = db.collection("streams");
Streams.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });
module.exports = { Users, Metadata, Streams, ObjectId };