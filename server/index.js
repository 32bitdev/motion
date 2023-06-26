const express = require("express");
const { Users } = require("./collecctions/mongoCollections");
const userRoutes = require("./routes/userRoutes");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use("/auth", userRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);