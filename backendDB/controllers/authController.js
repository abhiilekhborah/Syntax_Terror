const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = async (req, res, next) => {
  try {
    console.log('[Auth] Register attempt:', req.body);
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      console.warn('[Auth] Register failed: Missing fields');
      res.status(400);
      return res.json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400);
      return res.json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
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
    console.log('[Auth] Login attempt:', email);
    if (!email || !password) {
      res.status(400);
      return res.json({ message: 'Email and password are required' });
    }

    // Default development user fallback
    if (email.toLowerCase() === 'example@gmail.com' && password === 'pass') {
      console.log('[Auth] Using dev fallback for example@gmail.com');
      return res.json({
        token: 'dev-token-for-citizen',
        user: {
          id: 'dev-citizen-id',
          name: 'Default Citizen',
          email: 'example@gmail.com',
          role: 'citizen'
        }
      });
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