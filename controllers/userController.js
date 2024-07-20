const User = require('../models/user')
const bcrypt = require('bcrypt')
const generateToken = require('../middlewares/jwtMiddleware')

const registerUser = async (req, res) => {
  try {
    let { password, ...userData } = req.body

    let user = await User.findOne({
      username: userData.username,
    })

    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with given username already exists',
      })
    }
    user = new User({
      ...userData,
      passwordHash: bcrypt.hashSync(password, 10),
    })

    user = await user.save()

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'The user cannot be created' })
    }

    res
      .status(200)
      .json({ success: true, message: 'User registered successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error })
  }
}
const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username })
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      try {
        const token = generateToken(user.id, user.role)
        res.status(200).json({
          message: 'Login successful',
          success: true,
          user: {
            username: user.username,
            role: user.role,
          },
          token: token,
        })
      } catch (tokenError) {
        res.status(500).send('An error occurred while generating the token.')
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      })
    }
  } catch (error) {
    res
    res.status(500).json({
      success: false,
      message: "Nom d'utilisateur ou mot de passe incorrect",
    })
    console.log(error)
  }
}

const verifyJwt = (req, res) => {
  res.status(200).json({ success: true, message: 'Token is valid' })
}

const getUsers = async (req, res) => {
  console.log(req.user)
  try {
    const users = await User.find({
      isDrafted: false,
      _id: { $ne: req.user.userId },
    }).sort({ createdAt: -1 })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id

    let userData = {
      username: req.body.username,
      isDrafted: req.body.isDrafted,
      role: req.body.role,
    }
    if (req.body.password) {
      userData.passwordHash = await bcrypt.hash(req.body.password, 10)
    }
    const user = await User.findByIdAndUpdate(userId, userData, { new: true })
    res.status(200).json(user)
  } catch (error) {
    res
      .status(500)
      .send(
        "Une erreur s'est produite lors de la mise à jour de l'utilisateur."
      )
    console.log(error)
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyJwt,
  getUsers,
  updateUser,
}
