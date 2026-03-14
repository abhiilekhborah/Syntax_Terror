const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Attach user to req if a valid JWT cookie exists (for EJS pages)
const attachUserFromCookie = async (req, res, next) => {
  const token = req.cookies ? req.cookies.token : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (user) {
      req.user = user;
      res.locals.currentUser = user;
    } else {
      res.clearCookie('token');
    }
  } catch (err) {
    res.clearCookie('token');
  }

  next();
};

// Require an authenticated user (optionally with specific roles) for EJS routes
const requireWebAuth = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/login');
    }

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(req.user.role)
    ) {
      return res.status(403).send('Forbidden: insufficient permissions');
    }

    next();
  };
};

module.exports = { attachUserFromCookie, requireWebAuth };