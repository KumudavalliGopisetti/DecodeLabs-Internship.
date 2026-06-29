require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');

const connectDB     = require('./db');
const studentRoutes = require('./studentRoutes');
const authRoutes    = require('./authRoutes');
const errorHandler  = require('./errorHandler');

// ── Connect to MongoDB ─────────────────────────
connectDB();

const app = express();

/* ── CORS ─────────────────────────────────────── */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return cb(null, true);
      }
      cb(new Error(`CORS: origin "${origin}" not allowed`));
    },
    methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials:    true,
  })
);

/* ── Rate limiter ─────────────────────────────── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

/* ── Body parsers & logging ───────────────────── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ── Serve frontend from public/ ──────────────── */
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ── Health check ─────────────────────────────── */
app.get('/health', (_req, res) =>
  res.status(200).json({
    success: true,
    message: 'EduTrack API is running',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  })
);

/* ── API routes ───────────────────────────────── */
app.use('/api/auth',     authRoutes);
app.use('/api/students', studentRoutes);

/* ── API docs ─────────────────────────────────── */
app.get('/api', (_req, res) =>
  res.status(200).json({
    success: true,
    message: 'EduTrack API v1',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login:    'POST /api/auth/login',
        me:       'GET  /api/auth/me',
      },
      students: {
        list:   'GET    /api/students',
        stats:  'GET    /api/students/stats',
        get:    'GET    /api/students/:id',
        create: 'POST   /api/students',
        update: 'PUT    /api/students/:id',
        delete: 'DELETE /api/students/:id  (admin only)',
      },
      queryParams: {
        page:     'number (default 1)',
        limit:    'number (default 10, max 100)',
        sort:     'field or -field, comma-separated  e.g. "course,-year"',
        search:   'string — searches name, ID, email, course',
        course:   'exact course name filter',
        year:     'exact year filter e.g. "2nd Year"',
        isActive: '"true" | "false"',
      },
    },
  })
);

/* ── Serve index.html for any non-API route ───── */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── 404 handler (API routes only) ───────────── */
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
);

/* ── Global error handler ─────────────────────── */
app.use(errorHandler);

/* ── Start server ─────────────────────────────── */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀  EduTrack API running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   Health:   http://localhost:${PORT}/health`);
  console.log(`   API Docs: http://localhost:${PORT}/api\n`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully…`);
  server.close(() => {
    console.log('✔  HTTP server closed');
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
n