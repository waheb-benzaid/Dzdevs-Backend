const jwt = require("jsonwebtoken")
const config = require("config")

module.exports = (req, res, next) => {
  //Get token from header
  const token = req.header("x-auth-token")

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "no token, authorisation denied" })
  }

  //verify the token
  try {
    //this code is taken from the documentation
    const decoded = jwt.verify(token, config.get("jwtSecret"))
    req.user = decoded.user
    next()
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" })
  }
}
