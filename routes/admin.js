const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const userModel = require('../models/userModel');
const courseModel = require('../models/courseModel');
const db = require('../config/database');

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// Admin Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_count,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as teacher_count,
        (SELECT COUNT(*) FROM users WHERE role = 'student') as student_count,
        (SELECT COUNT(*) FROM users WHERE role = 'parent') as parent_count,
        (SELECT COUNT(*) FROM courses) as course_count,
        (SELECT COUNT(*) FROM quizzes) as quiz_count
    `);

    const [recentUsers] = await db.execute(`
      SELECT id, email, full_name, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.render('admin/dashboard', {
      user: req.session.user,
      stats: stats[0],
      recentUsers
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('error', { error: 'Error loading dashboard', user: req.session.user });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const role = req.query.role || null;
    const users = await userModel.getAllUsers(role);
    res.render('admin/users', { user: req.session.user, users, selectedRole: role });
  } catch (error) {
    console.error('Users list error:', error);
    res.render('error', { error: 'Error loading users', user: req.session.user });
  }
});

// Create User
router.get('/users/create', (req, res) => {
  res.render('admin/createUser', { user: req.session.user, error: null });
});

router.post('/users/create', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;
    
    if (!email || !password || !full_name || !role) {
      return res.render('admin/createUser', {
        user: req.session.user,
        error: 'All fields are required'
      });
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.render('admin/createUser', {
        user: req.session.user,
        error: 'Email already exists'
      });
    }

    await userModel.create({ email, password, full_name, role });
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Create user error:', error);
    res.render('admin/createUser', {
      user: req.session.user,
      error: 'Error creating user'
    });
  }
});

// Edit User
router.get('/users/:id/edit', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.render('error', { error: 'User not found', user: req.session.user });
    }
    res.render('admin/editUser', { user: req.session.user, editUser: user, error: null });
  } catch (error) {
    console.error('Edit user error:', error);
    res.render('error', { error: 'Error loading user', user: req.session.user });
  }
});

router.post('/users/:id/edit', async (req, res) => {
  try {
    const { email, full_name, role } = req.body;
    await userModel.updateUser(req.params.id, { email, full_name, role });
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Update user error:', error);
    res.render('admin/editUser', {
      user: req.session.user,
      editUser: { id: req.params.id, ...req.body },
      error: 'Error updating user'
    });
  }
});

// Delete User
router.post('/users/:id/delete', async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Delete user error:', error);
    res.redirect('/admin/users');
  }
});

// View All Courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await courseModel.getAll();
    res.render('admin/courses', { user: req.session.user, courses });
  } catch (error) {
    console.error('Courses list error:', error);
    res.render('error', { error: 'Error loading courses', user: req.session.user });
  }
});

// Delete Course (Admin)
router.post('/courses/:id/delete', async (req, res) => {
  try {
    await courseModel.delete(req.params.id);
    res.redirect('/admin/courses');
  } catch (error) {
    console.error('Delete course error:', error);
    res.redirect('/admin/courses');
  }
});

module.exports = router;
