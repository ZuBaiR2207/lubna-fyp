const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const quizModel = require('../models/quizModel');
const courseModel = require('../models/courseModel');

router.use(requireAuth);
router.use(requireRole('parent'));

// Parent Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get linked students
    const [students] = await db.execute(
      `SELECT u.id, u.full_name, u.email 
       FROM parent_student ps 
       JOIN users u ON ps.student_id = u.id 
       WHERE ps.parent_id = ?`,
      [req.session.user.id]
    );

    if (students.length === 0) {
      return res.render('parent/dashboard', {
        user: req.session.user,
        students: [],
        message: 'No students linked to your account. Please contact the administrator.'
      });
    }

    // Get overall statistics for all linked students
    const studentIds = students.map(s => s.id);
    const placeholders = studentIds.map(() => '?').join(',');

    const [stats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT qa.id) as total_attempts,
        AVG(qa.percentage) as average_score,
        COUNT(DISTINCT e.course_id) as enrolled_courses
      FROM quiz_attempts qa
      LEFT JOIN enrollments e ON qa.student_id = e.student_id
      WHERE qa.student_id IN (${placeholders})
    `, studentIds);

    // Get recent quiz attempts
    const [recentAttempts] = await db.execute(`
      SELECT qa.*, q.title as quiz_title, c.title as course_title, u.full_name as student_name
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      JOIN users u ON qa.student_id = u.id
      WHERE qa.student_id IN (${placeholders})
      ORDER BY qa.attempted_at DESC
      LIMIT 10
    `, studentIds);

    res.render('parent/dashboard', {
      user: req.session.user,
      students,
      stats: stats[0],
      recentAttempts
    });
  } catch (error) {
    console.error('Parent dashboard error:', error);
    res.render('error', { error: 'Error loading dashboard', user: req.session.user });
  }
});

// View Student Progress
router.get('/students/:studentId', async (req, res) => {
  try {
    // Verify parent-student relationship
    const [relationship] = await db.execute(
      'SELECT * FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [req.session.user.id, req.params.studentId]
    );

    if (relationship.length === 0) {
      return res.render('error', {
        error: 'Access denied. This student is not linked to your account.',
        user: req.session.user
      });
    }

    // Get student info
    const [studentRows] = await db.execute(
      'SELECT id, full_name, email FROM users WHERE id = ?',
      [req.params.studentId]
    );
    const student = studentRows[0];

    // Get enrolled courses
    const courses = await courseModel.getByStudent(req.params.studentId);

    // Get quiz attempts
    const attempts = await quizModel.getAttemptsByStudent(req.params.studentId);

    // Get attendance summary
    const [attendance] = await db.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
      FROM attendance
      WHERE student_id = ?
    `, [req.params.studentId]);

    res.render('parent/studentProgress', {
      user: req.session.user,
      student,
      courses,
      attempts,
      attendance: attendance[0]
    });
  } catch (error) {
    console.error('Student progress error:', error);
    res.render('error', { error: 'Error loading student progress', user: req.session.user });
  }
});

// View Quiz Result Details
router.get('/quizzes/:attemptId', async (req, res) => {
  try {
    const attempt = await quizModel.getAttemptDetails(req.params.attemptId);
    
    // Verify parent-student relationship
    const [relationship] = await db.execute(
      'SELECT * FROM parent_student WHERE parent_id = ? AND student_id = ?',
      [req.session.user.id, attempt.student_id]
    );

    if (relationship.length === 0) {
      return res.render('error', {
        error: 'Access denied',
        user: req.session.user
      });
    }

    const answers = await quizModel.getAttemptAnswers(req.params.attemptId);
    const quiz = await quizModel.findById(attempt.quiz_id);
    const course = await courseModel.findById(quiz.course_id);
    const [studentRows] = await db.execute(
      'SELECT full_name FROM users WHERE id = ?',
      [attempt.student_id]
    );

    res.render('parent/quizResult', {
      user: req.session.user,
      attempt,
      answers,
      quiz,
      course,
      student: studentRows[0]
    });
  } catch (error) {
    console.error('Quiz result error:', error);
    res.render('error', { error: 'Error loading quiz result', user: req.session.user });
  }
});

module.exports = router;
