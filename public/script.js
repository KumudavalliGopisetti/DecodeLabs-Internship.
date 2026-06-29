/* =============================================
   EduTrack — Student Management System
   script.js — Vanilla JS, LocalStorage
   ============================================= */

'use strict';

// ── State ──────────────────────────────────────
const STORAGE_KEY = 'edutrack_students';
let students = [];
let pendingDeleteId = null;
let notifTimer = null;

// ── DOM References ─────────────────────────────
const sidebar        = document.getElementById('sidebar');
const overlay        = document.getElementById('overlay');
const hamburger      = document.getElementById('hamburger');
const sidebarClose   = document.getElementById('sidebarClose');
const navItems       = document.querySelectorAll('.nav-item');
const pageTitle      = document.getElementById('pageTitle');
const sections       = document.querySelectorAll('.section');
const notification   = document.getElementById('notification');

// Dashboard
const statTotal    = document.getElementById('statTotal');
const statCourses  = document.getElementById('statCourses');
const statActive   = document.getElementById('statActive');
const fillTotal    = document.getElementById('fillTotal');
const fillCourses  = document.getElementById('fillCourses');
const fillActive   = document.getElementById('fillActive');
const recentList   = document.getElementById('recentList');

// Form
const studentForm  = document.getElementById('studentForm');
const editIdField  = document.getElementById('editId');
const formHeading  = document.getElementById('formHeading');
const submitBtn    = document.getElementById('submitBtn');
const cancelEdit   = document.getElementById('cancelEdit');

const fields = {
  studentId: document.getElementById('studentId'),
  fullName:  document.getElementById('fullName'),
  email:     document.getElementById('email'),
  phone:     document.getElementById('phone'),
  course:    document.getElementById('course'),
  year:      document.getElementById('year'),
};

// Table
const tableBody   = document.getElementById('tableBody');
const tableSearch = document.getElementById('tableSearch');
const searchInput = document.getElementById('searchInput');
const emptyState  = document.getElementById('emptyState');

// Modal
const modalBackdrop = document.getElementById('modalBackdrop');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');

// ── LocalStorage ───────────────────────────────
function load() {
  try {
    students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    students = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// ── Navigation ─────────────────────────────────
function showSection(name) {
  sections.forEach(s => s.classList.add('hidden'));
  const target = document.getElementById('section-' + name);
  if (target) target.classList.remove('hidden');

  navItems.forEach(n => {
    n.classList.toggle('active', n.dataset.section === name);
  });

  const titles = { dashboard: 'Dashboard', register: 'Add Student', students: 'Students' };
  pageTitle.textContent = titles[name] || '';

  if (name === 'dashboard') updateDashboard();
  if (name === 'students')  renderTable(students);
}

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    showSection(item.dataset.section);
    closeSidebar();
  });
});

// Delegate btn-link / btn-primary clicks with data-section
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-section]');
  if (btn && !btn.classList.contains('nav-item')) {
    showSection(btn.dataset.section);
    if (btn.dataset.section === 'register') resetForm();
  }
});

// ── Sidebar Toggle ─────────────────────────────
function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// ── Notification ────────────────────────────────
function notify(msg, type = 'success') {
  clearTimeout(notifTimer);
  const icon = type === 'success' ? '✓' : '✕';
  notification.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  notification.className = `notification ${type} show`;
  notifTimer = setTimeout(() => {
    notification.classList.remove('show');
  }, 3500);
}

// ── Validation ─────────────────────────────────
function clearErrors() {
  Object.keys(fields).forEach(k => {
    fields[k].classList.remove('invalid');
    document.getElementById('err-' + k).textContent = '';
  });
}

function setError(key, msg) {
  fields[key].classList.add('invalid');
  document.getElementById('err-' + key).textContent = msg;
}

function validateForm() {
  clearErrors();
  let valid = true;

  const { studentId, fullName, email, phone, course, year } = fields;

  if (!studentId.value.trim()) {
    setError('studentId', 'Student ID is required.'); valid = false;
  } else {
    // Check duplicate ID (excluding current edit)
    const dup = students.find(s =>
      s.studentId.toLowerCase() === studentId.value.trim().toLowerCase() &&
      s.id !== editIdField.value
    );
    if (dup) { setError('studentId', 'This Student ID already exists.'); valid = false; }
  }

  if (!fullName.value.trim()) {
    setError('fullName', 'Full name is required.'); valid = false;
  } else if (fullName.value.trim().length < 3) {
    setError('fullName', 'Name must be at least 3 characters.'); valid = false;
  }

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    setError('email', 'Email is required.'); valid = false;
  } else if (!emailRx.test(email.value.trim())) {
    setError('email', 'Enter a valid email address.'); valid = false;
  } else {
    const dup = students.find(s =>
      s.email.toLowerCase() === email.value.trim().toLowerCase() &&
      s.id !== editIdField.value
    );
    if (dup) { setError('email', 'This email is already registered.'); valid = false; }
  }

  const phoneRx = /^[6-9]\d{9}$/;
  if (!phone.value.trim()) {
    setError('phone', 'Phone number is required.'); valid = false;
  } else if (!phoneRx.test(phone.value.replace(/\s/g, ''))) {
    setError('phone', 'Enter a valid 10-digit Indian mobile number.'); valid = false;
  }

  if (!course.value) {
    setError('course', 'Please select a course.'); valid = false;
  }

  if (!year.value) {
    setError('year', 'Please select a year.'); valid = false;
  }

  return valid;
}

// ── Form Submit ────────────────────────────────
studentForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  const data = {
    studentId: fields.studentId.value.trim(),
    fullName:  fields.fullName.value.trim(),
    email:     fields.email.value.trim(),
    phone:     fields.phone.value.trim(),
    course:    fields.course.value,
    year:      fields.year.value,
  };

  if (editIdField.value) {
    // Update existing
    const idx = students.findIndex(s => s.id === editIdField.value);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...data };
      save();
      notify('Student record updated successfully.', 'success');
      resetForm();
      showSection('students');
    }
  } else {
    // Add new
    const student = { id: crypto.randomUUID(), createdAt: Date.now(), ...data };
    students.unshift(student);
    save();
    notify('Student added successfully!', 'success');
    resetForm();
    showSection('students');
  }
});

// ── Reset Form ─────────────────────────────────
function resetForm() {
  studentForm.reset();
  editIdField.value = '';
  clearErrors();
  formHeading.textContent = 'New Student';
  submitBtn.textContent   = 'Add Student';
  cancelEdit.classList.remove('visible');
}

cancelEdit.addEventListener('click', () => {
  resetForm();
  showSection('students');
});

// ── Edit Student ───────────────────────────────
function editStudent(id) {
  const s = students.find(st => st.id === id);
  if (!s) return;

  editIdField.value            = s.id;
  fields.studentId.value       = s.studentId;
  fields.fullName.value        = s.fullName;
  fields.email.value           = s.email;
  fields.phone.value           = s.phone;
  fields.course.value          = s.course;
  fields.year.value            = s.year;
  formHeading.textContent      = 'Edit Student';
  submitBtn.textContent        = 'Save Changes';
  cancelEdit.classList.add('visible');

  showSection('register');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Delete Student ─────────────────────────────
function promptDelete(id) {
  pendingDeleteId = id;
  modalBackdrop.classList.remove('hidden');
}

confirmDelete.addEventListener('click', () => {
  if (!pendingDeleteId) return;
  students = students.filter(s => s.id !== pendingDeleteId);
  save();
  pendingDeleteId = null;
  modalBackdrop.classList.add('hidden');
  renderTable(students);
  updateDashboard();
  notify('Student removed.', 'success');
});

cancelDeleteBtn.addEventListener('click', () => {
  pendingDeleteId = null;
  modalBackdrop.classList.add('hidden');
});

modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) {
    pendingDeleteId = null;
    modalBackdrop.classList.add('hidden');
  }
});

// ── Render Table ───────────────────────────────
function renderTable(list) {
  tableBody.innerHTML = '';

  if (!list.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  list.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-id">${esc(s.studentId)}</td>
      <td class="td-name">${esc(s.fullName)}</td>
      <td class="td-email">${esc(s.email)}</td>
      <td class="td-phone">${esc(s.phone)}</td>
      <td><span class="td-course">${esc(s.course)}</span></td>
      <td><span class="td-year">${esc(s.year)}</span></td>
      <td>
        <div class="actions">
          <button class="btn-edit"   data-id="${s.id}">Edit</button>
          <button class="btn-delete" data-id="${s.id}">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Delegate table actions
tableBody.addEventListener('click', e => {
  const editBtn   = e.target.closest('.btn-edit');
  const deleteBtn = e.target.closest('.btn-delete');
  if (editBtn)   editStudent(editBtn.dataset.id);
  if (deleteBtn) promptDelete(deleteBtn.dataset.id);
});

// ── Search ─────────────────────────────────────
function filterStudents(query) {
  const q = query.toLowerCase().trim();
  if (!q) return students;
  return students.filter(s =>
    s.fullName.toLowerCase().includes(q) ||
    s.studentId.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    s.course.toLowerCase().includes(q)
  );
}

tableSearch.addEventListener('input', () => {
  renderTable(filterStudents(tableSearch.value));
});

searchInput.addEventListener('input', () => {
  const results = filterStudents(searchInput.value);
  showSection('students');
  renderTable(results);
  if (searchInput.value.trim() && results.length === 0) {
    notify('No students match your search.', 'error');
  }
});

// ── Dashboard ──────────────────────────────────
function updateDashboard() {
  const total   = students.length;
  const courses = new Set(students.map(s => s.course)).size;
  // "Active" = 1st-3rd year students
  const active  = students.filter(s => ['1st Year','2nd Year','3rd Year'].includes(s.year)).length;

  animateCount(statTotal,   total);
  animateCount(statCourses, courses);
  animateCount(statActive,  active);

  // Progress bars — relative to max 100 students cap for visual
  const cap = Math.max(total, 1);
  setTimeout(() => {
    fillTotal.style.width   = Math.min((total   / Math.max(cap, 10)) * 100, 100) + '%';
    fillCourses.style.width = Math.min((courses / 8)                * 100, 100) + '%';
    fillActive.style.width  = total ? Math.min((active / total)     * 100, 100) + '%' : '0%';
  }, 100);

  renderRecent();
}

function animateCount(el, target) {
  const start    = parseInt(el.textContent) || 0;
  const duration = 600;
  const step     = 16;
  const steps    = duration / step;
  const inc      = (target - start) / steps;
  let   current  = start;
  let   count    = 0;
  const timer = setInterval(() => {
    count++;
    current += inc;
    el.textContent = Math.round(count >= steps ? target : current);
    if (count >= steps) clearInterval(timer);
  }, step);
}

function renderRecent() {
  const recent = students.slice(0, 5);
  if (!recent.length) {
    recentList.innerHTML = `<p style="padding:20px 24px;color:var(--text-muted);font-size:14px;">No students yet. Add one to get started.</p>`;
    return;
  }
  recentList.innerHTML = recent.map(s => `
    <div class="recent-item">
      <div class="recent-avatar">${initials(s.fullName)}</div>
      <div class="recent-info">
        <div class="recent-name">${esc(s.fullName)}</div>
        <div class="recent-meta">${esc(s.studentId)} · ${esc(s.year)}</div>
      </div>
      <span class="recent-course">${esc(s.course)}</span>
    </div>
  `).join('');
}

// ── Helpers ────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

// ── Init ───────────────────────────────────────
load();
showSection('dashboard');

// Seed demo data if empty
if (!students.length) {
  const demo = [
    { id: crypto.randomUUID(), createdAt: Date.now(), studentId: 'STU-2025-001', fullName: 'Aditya Sharma',   email: 'aditya@example.com',   phone: '9876543210', course: 'Computer Science',     year: '2nd Year' },
    { id: crypto.randomUUID(), createdAt: Date.now(), studentId: 'STU-2025-002', fullName: 'Priya Nair',      email: 'priya@example.com',    phone: '9123456780', course: 'Data Science',          year: '1st Year' },
    { id: crypto.randomUUID(), createdAt: Date.now(), studentId: 'STU-2025-003', fullName: 'Rohit Verma',     email: 'rohit@example.com',    phone: '9988776655', course: 'Artificial Intelligence', year: '3rd Year' },
    { id: crypto.randomUUID(), createdAt: Date.now(), studentId: 'STU-2025-004', fullName: 'Sneha Kulkarni',  email: 'sneha@example.com',    phone: '9871234567', course: 'Electronics Engineering', year: '2nd Year' },
    { id: crypto.randomUUID(), createdAt: Date.now(), studentId: 'STU-2025-005', fullName: 'Karthik Menon',   email: 'karthik@example.com',  phone: '9765432100', course: 'Business Administration', year: '4th Year' },
  ];
  students = demo;
  save();
  updateDashboard();
}