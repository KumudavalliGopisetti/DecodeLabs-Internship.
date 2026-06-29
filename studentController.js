const Student = require('./Student');   // ✅ flat path

/* ── Helpers ──────────────────────────────────── */

const SORTABLE_FIELDS = new Set([
  'fullName', 'studentId', 'email', 'course', 'year', 'createdAt',
]);

function buildSort(sortParam) {
  const sort = {};
  if (!sortParam) {
    sort.createdAt = -1;
    return sort;
  }
  sortParam.split(',').forEach((field) => {
    const dir  = field.startsWith('-') ? -1 : 1;
    const name = field.replace(/^-/, '');
    if (SORTABLE_FIELDS.has(name)) sort[name] = dir;
  });
  return Object.keys(sort).length ? sort : { createdAt: -1 };
}

/* ── GET /students ──────────────────────────────
   Query params: page, limit, sort, search, course, year, isActive
─────────────────────────────────────────────── */
exports.getStudents = async (req, res, next) => {
  try {
    const page  = Math.max(parseInt(req.query.page,  10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const skip  = (page - 1) * limit;
    const sort  = buildSort(req.query.sort);

    const filter = {};

    if (req.query.search) {
      const rx = new RegExp(
        req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'
      );
      filter.$or = [
        { fullName:  rx },
        { studentId: rx },
        { email:     rx },
        { course:    rx },
      ];
    }

    if (req.query.course)            filter.course   = req.query.course;
    if (req.query.year)              filter.year     = req.query.year;
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive !== 'false';
    }

    const [students, total] = await Promise.all([
      Student.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      success:    true,
      count:      students.length,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      data:       students,
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /students/:id ─────────────────────────── */
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

/* ── POST /students ────────────────────────────── */
exports.createStudent = async (req, res, next) => {
  try {
    const { studentId, fullName, email, phone, course, year } = req.body;
    const student = await Student.create({ studentId, fullName, email, phone, course, year });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      data:    student,
    });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /students/:id ─────────────────────────── */
exports.updateStudent = async (req, res, next) => {
  try {
    const allowed = ['studentId', 'fullName', 'email', 'phone', 'course', 'year', 'isActive'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      data:    student,
    });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /students/:id ──────────────────────── */
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.status(200).json({
      success: true,
      message: `Student "${student.fullName}" deleted successfully.`,
      data:    { id: student._id },
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /students/stats ───────────────────────── */
exports.getStats = async (req, res, next) => {
  try {
    const [total, active, byCourse, byYear] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ isActive: true }),
      Student.aggregate([
        { $group: { _id: '$course', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
      ]),
      Student.aggregate([
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort:  { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        courses:  byCourse.map((d) => ({ course: d._id, count: d.count })),
        years:    byYear.map((d)   => ({ year:   d._id, count: d.count })),
      },
    });
  } catch (err) {
    next(err);
  }
};
