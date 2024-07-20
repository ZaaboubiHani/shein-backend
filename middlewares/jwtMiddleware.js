const jwt = require("jsonwebtoken");
const secret = process.env.secret;

function generateToken(userId, role) {
  return jwt.sign(
    {
      userId: userId,
      role: role,
    },
    secret
  );
}

module.exports = generateToken;
