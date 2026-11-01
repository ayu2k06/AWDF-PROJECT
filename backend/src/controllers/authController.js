const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createUser, findUserByEmail, updateUser } = require('../services/memoryStore');

const toPublicUser = ({ passwordHash, ...user }) => user;

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || /replace|your_|change_this/i.test(secret)) {
    throw new Error('JWT_SECRET must be configured with at least 32 random characters');
  }
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);
    const existingUser = findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const user = createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      avatar: null,
      role: 'user',
      preferences: { theme: 'light', notifications: true },
      lastLogin: null,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: toPublicUser(user),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password } = req.body;

    const user = findUserByEmail(email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    updateUser(user._id, { lastLogin: new Date() });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: toPublicUser(user),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

// @desc    Update user preferences/profile
// @route   PATCH /api/auth/me
// @access  Protected
const updateMe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map((error) => ({ field: error.path, message: error.msg })),
      });
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.preferences !== undefined) {
      const { theme, notifications } = req.body.preferences;
      updates.preferences = {
        ...req.user.preferences,
        ...(theme === undefined ? {} : { theme }),
        ...(notifications === undefined ? {} : { notifications }),
      };
    }

    const user = updateUser(req.user._id, updates);

    res.status(200).json({ success: true, data: { user: toPublicUser(user) } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe };
