const express = require('express');
const router = express.Router();
const path = require('path');
const { requireAuth, requireRole } = require('../middleware/auth');
const courseModel = require('../models/courseModel');
const materialModel = require('../models/materialModel');
const quizModel = require('../models/quizModel');
const userModel = require('../models/userModel');
const db = require('../config/database');

router.use(requireAuth);
router.use(requireRole('teacher'));

// Teacher Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const courses = await courseModel.getByTeacher(req.session.user.id);
    const [stats] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM courses WHERE teacher_id = ?) as course_count,
        (SELECT COUNT(*) FROM quizzes q JOIN courses c ON q.course_id = c.id WHERE c.teacher_id = ?) as quiz_count,
        (SELECT COUNT(*) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = ?) as student_count
    `, [req.session.user.id, req.session.user.id, req.session.user.id]);

    res.render('teacher/dashboard', {
      user: req.session.user,
      courses,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.render('error', { error: 'Error loading dashboard', user: req.session.user });
  }
});

// Courses Management
router.get('/courses', async (req, res) => {
  try {
    const courses = await courseModel.getByTeacher(req.session.user.id);
    res.render('teacher/courses', { user: req.session.user, courses });
  } catch (error) {
    console.error('Courses error:', error);
    res.render('error', { error: 'Error loading courses', user: req.session.user });
  }
});

router.get('/courses/create', (req, res) => {
  res.render('teacher/createCourse', { user: req.session.user, error: null });
});

router.post('/courses/create', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.render('teacher/createCourse', {
        user: req.session.user,
        error: 'Title is required'
      });
    }
    await courseModel.create({
      title,
      description: description || '',
      teacher_id: req.session.user.id
    });
    res.redirect('/teacher/courses');
  } catch (error) {
    console.error('Create course error:', error);
    res.render('teacher/createCourse', {
      user: req.session.user,
      error: 'Error creating course'
    });
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id);
    if (!course || course.teacher_id != req.session.user.id) {
      return res.render('error', { error: 'Course not found', user: req.session.user });
    }
    const materials = await materialModel.getByCourse(req.params.id);
    const quizzes = await quizModel.getByCourse(req.params.id);
    const students = await courseModel.getEnrolledStudents(req.params.id);
    const allStudents = await userModel.getStudents();
    res.render('teacher/courseDetail', {
      user: req.session.user,
      course,
      materials,
      quizzes,
      students,
      allStudents
    });
  } catch (error) {
    console.error('Course detail error:', error);
    res.render('error', { error: 'Error loading course', user: req.session.user });
  }
});

// Upload Material
router.post('/courses/:id/materials', async (req, res) => {
  try {
    const upload = req.app.locals.upload.single('material');
    upload(req, res, async (err) => {
      if (err) {
        return res.render('error', { error: err.message, user: req.session.user });
      }
      if (!req.file) {
        return res.redirect(`/teacher/courses/${req.params.id}?error=No file uploaded`);
      }
      await materialModel.create({
        course_id: req.params.id,
        title: req.body.title || req.file.originalname,
        file_path: req.file.filename,
        file_type: path.extname(req.file.originalname),
        uploaded_by: req.session.user.id
      });
      res.redirect(`/teacher/courses/${req.params.id}`);
    });
  } catch (error) {
    console.error('Upload material error:', error);
    res.redirect(`/teacher/courses/${req.params.id}?error=Upload failed`);
  }
});

// Delete Material
router.post('/materials/:id/delete', async (req, res) => {
  try {
    const material = await materialModel.findById(req.params.id);
    if (material) {
      await materialModel.delete(req.params.id);
      res.redirect(`/teacher/courses/${material.course_id}`);
    } else {
      res.redirect('/teacher/courses');
    }
  } catch (error) {
    console.error('Delete material error:', error);
    res.redirect('/teacher/courses');
  }
});

// Quiz Management
router.get('/courses/:id/quizzes/create', (req, res) => {
  res.render('teacher/createQuiz', {
    user: req.session.user,
    courseId: req.params.id,
    error: null
  });
});

router.post('/courses/:id/quizzes/create', async (req, res) => {
  try {
    let { title, description, questions } = req.body;
    // Convert questions from object (form sends questions[0], questions[1]...) to array
    if (questions && typeof questions === 'object' && !Array.isArray(questions)) {
      questions = Object.keys(questions)
        .sort((a, b) => Number(a) - Number(b))
        .map(key => questions[key]);
    }
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.render('teacher/createQuiz', {
        user: req.session.user,
        courseId: req.params.id,
        error: 'Title and at least one question are required'
      });
    }

    // Calculate total marks
    let totalMarks = 0;
    questions.forEach(q => {
      totalMarks += parseInt(q.marks) || 1;
    });

    const quizId = await quizModel.create({
      course_id: req.params.id,
      title,
      description: description || '',
      created_by: req.session.user.id,
      total_marks: totalMarks
    });

    // Add questions
    for (const q of questions) {
      if (q.question_text && q.correct_answer) {
        await quizModel.addQuestion({
          quiz_id: quizId,
          question_text: q.question_text,
          option_a: q.option_a || '',
          option_b: q.option_b || '',
          option_c: q.option_c || '',
          option_d: q.option_d || '',
          correct_answer: q.correct_answer,
          marks: parseInt(q.marks) || 1
        });
      }
    }

    res.redirect(`/teacher/courses/${req.params.id}`);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.render('teacher/createQuiz', {
      user: req.session.user,
      courseId: req.params.id,
      error: 'Error creating quiz'
    });
  }
});

router.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.params.id);
    const course = await courseModel.findById(quiz.course_id);
    if (course.teacher_id != req.session.user.id) {
      return res.render('error', { error: 'Access denied', user: req.session.user });
    }
    const questions = await quizModel.getQuestions(req.params.id);
    const stats = await quizModel.getQuizStatistics(req.params.id);
    const [attempts] = await db.execute(`
      SELECT qa.*, u.full_name as student_name 
      FROM quiz_attempts qa 
      JOIN users u ON qa.student_id = u.id 
      WHERE qa.quiz_id = ? 
      ORDER BY qa.attempted_at DESC
    `, [req.params.id]);

    res.render('teacher/quizDetail', {
      user: req.session.user,
      quiz,
      course,
      questions,
      stats,
      attempts
    });
  } catch (error) {
    console.error('Quiz detail error:', error);
    res.render('error', { error: 'Error loading quiz', user: req.session.user });
  }
});

// Delete Course
router.post('/courses/:id/delete', async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id);
    if (!course || course.teacher_id != req.session.user.id) {
      return res.status(403).render('error', { error: 'Access denied', user: req.session.user });
    }
    await courseModel.delete(req.params.id);
    res.redirect('/teacher/courses');
  } catch (error) {
    console.error('Delete course error:', error);
    res.redirect('/teacher/courses');
  }
});

// Delete Quiz
router.post('/quizzes/:id/delete', async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.params.id);
    const course = await courseModel.findById(quiz.course_id);
    if (!course || course.teacher_id != req.session.user.id) {
      return res.status(403).render('error', { error: 'Access denied', user: req.session.user });
    }
    await quizModel.deleteQuiz(req.params.id);
    res.redirect(`/teacher/courses/${quiz.course_id}`);
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.redirect('/teacher/courses');
  }
});

// Enroll Student
router.post('/courses/:id/enroll', async (req, res) => {
  try {
    const { student_id } = req.body;
    const enrolled = await courseModel.enrollStudent(req.params.id, student_id);
    if (!enrolled) {
      return res.redirect(`/teacher/courses/${req.params.id}?error=Student already enrolled`);
    }
    res.redirect(`/teacher/courses/${req.params.id}`);
  } catch (error) {
    console.error('Enroll student error:', error);
    res.redirect(`/teacher/courses/${req.params.id}?error=Enrollment failed`);
  }
});

module.exports = router;
