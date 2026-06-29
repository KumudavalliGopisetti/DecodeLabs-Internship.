const mongoose = require('mongoose');

const COURSES = [
  'Computer Science',
  'Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Data Science',
  'Artificial Intelligence',
  'Biotechnology',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type:     String,
      required: [true, 'Student ID is required'],
      unique:   true,
      trim:     true,
      uppercase: true,
      match: [
        /^[A-Z0-9\-]{3,20}$/,
        'Student ID may only contain letters, numbers, and hyphens (3–20 chars)',
      ],
    },

    fullName: {
      type:      String,
      required:  [true, 'Full name is required'],
      trim:      true,
      minlength: [3,  'Name must be at least 3 characters'],
      maxlength: [80, 'Name must be 80 characters or fewer'],
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      trim:      true,
      lowercase: true,
      match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },

    phone: {
      type:     String,
      required: [true, 'Phone number is required'],
      trim:     true,
      match:    [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    },

    course: {
      type:     String,
      required: [true, 'Course is required'],
      enum:     { values: COURSES, message: 'Course "{VALUE}" is not offered' },
    },

    year: {
      type:     String,
      required: [true, 'Year is required'],
      enum:     { values: YEARS, message: 'Year "{VALUE}" is not valid' },
    },

    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
studentSchema.index(
  { fullName: 'text', studentId: 'text', email: 'text', course: 'text' },
  { name: 'student_text_search' }
);

studentSchema.index({ course: 1, year: 1 });
studentSchema.index({ isActive: 1, createdAt: -1 });

// Virtual: initials
studentSchema.virtual('initials').get(function () {
  return this.fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
});

studentSchema.statics.COURSES = COURSES;
studentSchema.statics.YEARS   = YEARS;

module.exports = mongoose.model('Student', studentSchema);
