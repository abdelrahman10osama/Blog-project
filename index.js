require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");

const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch(err => console.log(err.message));

app.use(express.json());

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});