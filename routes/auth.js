const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const { requireAuth } = require('../middleware/auth');

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    const role = req.session.user.role;
    if (role === 'admin') return res.redirect('/admin/dashboard');
    if (role === 'teacher') return res.redirect('/teacher/dashboard');
    if (role === 'student') return res.redirect('/student/dashboard');
    if (role === 'parent') return res.redirect('/parent/dashboard');
  }
  res.render('auth/login', { error: null });
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.render('auth/login', { error: 'Email and password are required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.render('auth/login', { error: 'Invalid email or password' });
    }

    const isValidPassword = await userModel.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.render('auth/login', { error: 'Invalid email or password' });
    }

    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      primary_level: user.primary_level != null ? Number(user.primary_level) : null
    };

    // Redirect based on role
    const role = user.role;
    if (role === 'admin') return res.redirect('/admin/dashboard');
    if (role === 'teacher') return res.redirect('/teacher/dashboard');
    if (role === 'student') return res.redirect('/student/dashboard');
    if (role === 'parent') return res.redirect('/parent/dashboard');
    
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { error: 'An error occurred. Please try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
