const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator/check")
const User = require("../../models/User")

// @route POST api/users
// @desc register user
// @access Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmail(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      " Please enter a password with 6 or more characters",
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log(req.body)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }) //bad request
    }

    const { name, email, password } = req.body

    try {
      //see if user exists
      let user = await User.findOne({ email }) //I have tested with the email because it's unique
      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] })
      }
      //Get users gravatar
      //Encrypt the password
      //return JWT
      res.send("User router")
    } catch (err) {
      console.log(err.message)
    }
  },
)

module.exports = router
