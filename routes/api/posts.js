const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator/check")
const auth = require("../../middleware/auth")
const Profile = require("../../models/Profile")
const Post = require("../../models/Post")
const User = require("../../models/User")

// @route POST api/posts
// @desc  Create a post route
// @access Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }) //this test means that there are some errors (Bad request)
    }
    try {
      const user = await User.findById(req.user.id).select("-password") //here the user is logged in , so we have the Token , that means that we can get the user id from req.user.id

      newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      })

      const post = await newPost.save()
      res.json(post)
    } catch (err) {
      console.error(err.message)
      res.status(500).send("server error")
    }
  },
)

// @route GET api/posts
// @desc  Get all posts
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("server error")
  }
})

// @route GET api/posts/:id
// @desc  Get post by id
// @access Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ msg: "post is not found" })
    }
    res.json(post)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("server error")
  }
})

// @route DELETE api/posts/:id
// @desc  Delete post by postId
// @access Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ msg: "post is not found" })
    }

    //Check if the user does not match th the user logged in
    if (post.user.toString() !== req.params.id) {
      return res.status(401).json({ msg: "User not authorized" })
    }

    await Post.remove()

    res.json({ msg: "post removed" })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("server error")
  }
})

module.exports = router
