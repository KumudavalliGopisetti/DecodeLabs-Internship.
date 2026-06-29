const jwt  = require('jsonwebtoken');
const User = require('./User');   // ✅ flat path

/* ── Helper: sign & send token ───────────────── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const { password, ...userData } = user.toObject();

  res.status(statusCode).json({
    success: true,
    token,
    data:    userData,
  });
};

/* ── POST /api/auth/register ─────────────────── */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({ name, email, password, role });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/auth/login ────────────────────── */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
      });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/auth/me ────────────────────────── */
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};
