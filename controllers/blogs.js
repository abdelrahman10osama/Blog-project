const router = require("express").Router();
const Blog = require("../models/blogs");   
const User = require("../models/users");  

// GET all blogs
router.get("/", async (req, res) => {
  try {
    const { search, author, sortBy, order, page = 1, limit = 10 } = req.query;


    let filter = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (author) {
      filter.author = {
        $regex: author,
        $options: "i",
      };
    }


    let sort = {};

if (sortBy) {
  if (sortBy !== "likes") {
    return res.status(400).json({
      error: "invalid sort field",
    });
  }

  sort = {
    [sortBy]: order === "asc" ? 1 : -1,
  };
}

    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .populate("user", { username: 1, name: 1 })
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    res.json({
      data: blogs,
      pagination: {
        currentPage: pageNumber,
        pageSize: limitNumber,
        totalBlogs: total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });

  } catch (error) {
    res.status(500).json({ error: "something went wrong" });
  }
});

// LIKE blog
router.patch("/:id/like", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    
    if (!blog) {
      return res.status(404).json({ error: "blog not found" });
    }

    blog.likes = (blog.likes || 0) + 1;

    const updatedBlog = await blog.save();

    res.status(200).json(updatedBlog);

  } catch (error) {
    res.status(400).json({ error: "malformed id" });
  }
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