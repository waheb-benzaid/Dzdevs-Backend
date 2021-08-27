const express = require("express")
const router = express.Router()
const auth = require("../../middleware/auth")
const Profile = require("../../models/Profile")
const User = require("../../models/User")

// @route GET api/profile/me
// @desc GET current users profile route
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"], //name and avatar are in the User model, so I have used the populate methode to add theme to the Profile
    )

    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" })
    }

    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("server error")
  }
})

module.exports = router
