const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token noto‘g‘ri yoki muddati o‘tgan!" });
    }
  } else {
    return res.status(401).json({ message: "Avtorizatsiya talab qilinadi!" });
  }
};

// Admin ekanligini tekshiruvchi middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Sizda bu amalni bajarish uchun ruxsat yo‘q!" });
  }
};

module.exports = { protect, isAdmin };
