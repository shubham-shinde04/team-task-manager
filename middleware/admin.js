module.exports = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Admin access only" });
  }
  next();
};