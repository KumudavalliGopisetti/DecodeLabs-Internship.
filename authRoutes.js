const express     = require('express');
const { body }    = require('express-validator');

const ctrl          = require('./authController');   // ✅ flat path
const { protect }   = require('./auth');             // ✅ flat path
const validate      = require('./validate');         // ✅ flat path

const router = express.Router();

/* ── Validation rules ────────────────────────── */

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 60 }).withMessage('Name must be 60 characters or fewer'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'staff']).withMessage('Role must be "admin" or "staff"'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

/* ── Routes ──────────────────────────────────── */
router.post('/register', registerRules, validate, ctrl.register);
router.post('/login',    loginRules,    validate, ctrl.login);
router.get('/me', protect, ctrl.getMe);

module.exports = router;
