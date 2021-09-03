const express = require("express")
const router = express.Router()
const auth = require("../../middleware/auth")
const Profile = require("../../models/Profile")
const User = require("../../models/User")
const { check, validationResult } = require("express-validator/check")

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

// @route POST api/profile
// @desc create & update users profile route
// @access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    console.log(req.body)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }) //this test means that there are some errors (Bad request)
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body

    //Build profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if (company) {
      profileFields.company = company
    }
    if (website) {
      profileFields.website = website
    }
    if (location) {
      profileFields.location = location
    }
    if (bio) {
      profileFields.bio = bio
    }
    if (status) {
      profileFields.status = status
    }
    if (githubusername) {
      profileFields.githubusername = githubusername
    }
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim())
    }

    //Build Social object
    profileFields.social = {}
    if (youtube) {
      profileFields.social.youtube = youtube
    }
    if (twitter) {
      profileFields.social.twitter = twitter
    }
    if (instagram) {
      profileFields.social.instagram = instagram
    }
    if (facebook) {
      profileFields.social.facebook = facebook
    }
    if (linkedin) {
      profileFields.social.linkedin = linkedin
    }
    try {
      let profile = await Profile.findOne({ user: req.user.id })
      if (profile) {
        //if profile exists, the update mode is activated, else I will insert the profile because it does not exixts
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true },
        )
        return res.json(profile)
      }
      //Mode insert activated if the profile does not exist
      profile = new Profile(profileFields)
      await profile.save()
      return res.json(profile)
    } catch (err) {
      console.log(err.message)
      res.status(500).send("server error")
    }
  },
)

// @route Get api/profile
// @desc Get all profiles
// @access Public
router.get("/", async (req, res) => {
  try {
    const profile = await Profile.find().populate("user", ["name", "avatar"])
    if (profile) {
      return res.status(200).json(profile)
    }
  } catch (err) {
    console.log(err.message)
    res.status(500).send("server error")
  }
})

// @route Get api/profile/user/:user_id
// @desc Get profile by user ID
// @access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"])
    if (!profile) {
      return res.status(400).json({ msg: "Profile not found" })
    }

    res.json(profile)
  } catch (err) {
    console.log(err.message)
    if (err.kind === "ObjectId") {
      //if we tap an Id which not exists, the catch will work .
      //so we can test if there is a problem in the user Id, if it is , we can return Profile not found instead of server error
      return res.status(400).json({ msg: "Profile not found" })
    }
    res.status(500).send("server error")
  }
})

// @route DELETE api/profile
// @desc Delete profil, user and posts
// @access private
router.delete("/", auth, async (req, res) => {
  try {
    // @todo - remove users posts
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id })
    //Remove user
    await User.findOneAndRemove({ _id: req.user.id })

    res.json({ msg: "user deleted" })
  } catch (err) {
    console.log(err.message)
    res.status(500).send("server error")
  }
})

// @route PUT api/profile/experience
// @desc  Add profile experience
// @access private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, company, location, from, to, current, description } =
      req.body

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id })
      console.log(profile)

      profile.experience.unshift(newExperience)
      await profile.save()
      res.json(profile)
    } catch (err) {
      console.log(err.message)
      res.status(500).send("server error")
    }
  },
)

// @route DELETE api/profile/experience/:exp_id
// @desc  delete experience from profile
// @access private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })

    // Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id)

    profile.experience.splice(removeIndex, 1)
    await profile.save()
    res.json(profile)
  } catch (err) {
    console.log(err.message)
    res.status(500).send("Server Error")
  }
})
module.exports = router
