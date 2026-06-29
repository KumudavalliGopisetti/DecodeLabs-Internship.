const { validationResult } = require('express-validator');

/**
 * Place this AFTER express-validator rule chains in any route.
 * If validation errors exist → responds 400 with structured errors array.
 * If no errors → calls next() to continue to the controller.
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field:   e.path,
    message: e.msg,
  }));

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
};

module.exports = validate;
