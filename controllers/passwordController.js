const Password = require('../models/password')
const bcrypt = require('bcrypt')

// Create Password
const createPassword = async (req, res) => {
  try {
    const { password } = req.body
    const passwordHash = await bcrypt.hash(password, 10)

    const newPassword = new Password({ passwordHash })
    const savedPassword = await newPassword.save()

    res.status(200).json({
      success: true,
      message: 'Password created successfully',
      data: savedPassword,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Update Password
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    const passwordRecord = await Password.findOne()

    const isMatch = await bcrypt.compare(
      oldPassword,
      passwordRecord.passwordHash
    )
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Old password is incorrect' })
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    const updatedPassword = await Password.findByIdAndUpdate(
      passwordRecord._id,
      { passwordHash: newPasswordHash },
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: updatedPassword,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Verify Password
const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body

    const passwordRecord = await Password.findOne()
    const isMatch = await bcrypt.compare(password, passwordRecord.passwordHash)
    if (isMatch) {
      res.status(200).json({ success: true, message: 'Password is valid' })
    } else {
      res.status(400).json({ success: false, message: 'Invalid password' })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

module.exports = {
  createPassword,
  updatePassword,
  verifyPassword,
}
