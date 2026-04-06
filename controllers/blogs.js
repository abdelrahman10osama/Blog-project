const router = require("express").Router();
const Blog = require("../models/blogs");   
const User = require("../models/users");  

// GET all blogs
router.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });

  res.json(blogs);
});

// POST blog
router.post("/", async (req, res) => {
  const body = req.body;

  const user = await User.findOne();

  const blog = new Blog({
    ...body,
    likes: body.likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  res.status(201).json(savedBlog);
});

module.exports = router;