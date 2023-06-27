//mongodb collections configuration
require("dotenv").config();
const { ObjectId, MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL);
const db = client.db("motion");
client.connect();
const Users = db.collection("users");
const Metadata = db.collection("metaDatas");
module.exports = { Users, Metadata, ObjectId };