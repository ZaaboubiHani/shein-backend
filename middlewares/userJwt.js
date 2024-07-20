const jwt = require("jsonwebtoken");

function userJwt(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("err1");
    return res.status(401).json({ error: "Token is required" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.error("err2");
      return res.status(401).json({ error: "Token has expired" });
    }
    console.error("err3");
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = userJwt;
