const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/users");

// GET users
router.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    url: 1,
  });

  res.json(users);
});

// CREATE user
router.post("/", async (req, res) => {
  const { username, name, password } = req.body;

  if (!username || !password || password.length < 3) {
    return res.status(400).json({
      error: "username and password must be at least 3 characters",
    });
  }

  const exist = await User.findOne({ username });

  if (exist) {
    return res.status(400).json({
      error: "username must be unique",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  res.status(201).json(savedUser);
});

module.exports = router;