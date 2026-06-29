const express          = require('express');
const { body, param }  = require('express-validator');

const ctrl                   = require('./studentController');   // ✅ flat path
const { protect, authorize } = require('./auth');               // ✅ flat path
const validate               = require('./validate');           // ✅ flat path

const router = express.Router();

/* ── Validation rule sets ──────────────────────── */

const studentIdParam = param('id')
  .isMongoId()
  .withMessage('Invalid student ID format');

const createRules = [
  body('studentId')
    .trim()
    .notEmpty().withMessage('Student ID is required')
    .isLength({ min: 3, max: 20 }).withMessage('Student ID must be 3–20 characters')
    .matches(/^[A-Z0-9\-]+$/i).withMessage('Student ID may only contain letters, numbers, and hyphens'),

  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3, max: 80 }).withMessage('Name must be 3–80 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),

  body('course')
    .notEmpty().withMessage('Course is required')
    .isIn([
      'Computer Science', 'Electronics Engineering', 'Mechanical Engineering',
      'Civil Engineering', 'Business Administration', 'Data Science',
      'Artificial Intelligence', 'Biotechnology',
    ]).withMessage('Invalid course selected'),

  body('year')
    .notEmpty().withMessage('Year is required')
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year'])
    .withMessage('Year must be 1st–4th Year'),
];

// For PUT: all fields optional, but still validated when present
const updateRules = createRules.map((rule) => rule.optional());
updateRules.push(
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false')
);

/* ── Routes ────────────────────────────────────── */

// /stats must come BEFORE /:id — otherwise "stats" is treated as a Mongo ID
router.get('/stats', protect, ctrl.getStats);

router
  .route('/')
  .get(protect, ctrl.getStudents)
  .post(protect, createRules, validate, ctrl.createStudent);

router
  .route('/:id')
  .get(protect, studentIdParam, validate, ctrl.getStudent)
  .put(protect, studentIdParam, updateRules, validate, ctrl.updateStudent)
  .delete(protect, authorize('admin'), studentIdParam, validate, ctrl.deleteStudent);

module.exports = router;
