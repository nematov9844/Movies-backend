const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Sizda ruxsat yo‘q!" });
    }
    next();
  };
  
  module.exports = adminMiddleware;
  