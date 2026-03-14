const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, zone, role } = req.body;

    if (!firstName || !email || !password) {
      res.status(400);
      return res.json({ message: 'First name, email and password are required' });
    }

    const name = lastName ? `${firstName} ${lastName}` : firstName;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400);
      return res.json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      zone,
      role: role && ['citizen', 'authority', 'admin'].includes(role)
        ? role
        : 'citizen'
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return res.json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401);
      return res.json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      return res.json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };