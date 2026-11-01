const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.patch(
  '/me',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object'),
    body('preferences.theme').optional().isIn(['dark', 'light', 'system']).withMessage('Invalid theme'),
    body('preferences.notifications').optional().isBoolean().toBoolean().withMessage('Notifications must be a boolean'),
  ],
  updateMe
);

module.exports = router;
