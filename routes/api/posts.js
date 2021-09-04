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

module.exports = router
