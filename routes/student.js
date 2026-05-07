const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const courseModel = require('../models/courseModel');
const materialModel = require('../models/materialModel');
const quizModel = require('../models/quizModel');

router.use(requireAuth);
router.use(requireRole('student'));

// Student Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const courses = await courseModel.getByStudent(req.session.user.id);
    const attempts = await quizModel.getAttemptsByStudent(req.session.user.id);
    
    // Get recent attempts (last 5)
    const recentAttempts = attempts.slice(0, 5);

    res.render('student/dashboard', {
      user: req.session.user,
      courses,
      recentAttempts
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.render('error', { error: 'Error loading dashboard', user: req.session.user });
  }
});

// My Courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await courseModel.getByStudent(req.session.user.id);
    res.render('student/courses', { user: req.session.user, courses });
  } catch (error) {
    console.error('Courses error:', error);
    res.render('error', { error: 'Error loading courses', user: req.session.user });
  }
});

// Course Detail
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id);
    const materials = await materialModel.getByCourse(req.params.id);
    const quizzes = await quizModel.getByCourse(req.params.id);
    
    // Get student's attempts for quizzes in this course
    const attempts = await quizModel.getAttemptsByStudent(req.session.user.id, req.params.id);
    const attemptMap = {};
    attempts.forEach(attempt => {
      attemptMap[attempt.quiz_id] = attempt;
    });

    res.render('student/courseDetail', {
      user: req.session.user,
      course,
      materials,
      quizzes,
      attemptMap
    });
  } catch (error) {
    console.error('Course detail error:', error);
    res.render('error', { error: 'Error loading course', user: req.session.user });
  }
});

// Take Quiz
router.get('/quizzes/:id/take', async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.params.id);
    const course = await courseModel.findById(quiz.course_id);
    const questions = await quizModel.getQuestions(req.params.id);
    
    res.render('student/takeQuiz', {
      user: req.session.user,
      quiz,
      course,
      questions
    });
  } catch (error) {
    console.error('Take quiz error:', error);
    res.render('error', { error: 'Error loading quiz', user: req.session.user });
  }
});

// Submit Quiz
router.post('/quizzes/:id/submit', async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.params.id);
    const questions = await quizModel.getQuestions(req.params.id);
    const answers = req.body.answers || {};
    
    let score = 0;
    const answerData = [];

    questions.forEach(question => {
      const selectedAnswer = answers[question.id] || '';
      const isCorrect = selectedAnswer === question.correct_answer;
      
      if (isCorrect) {
        score += question.marks;
      }

      answerData.push({
        question_id: question.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect
      });
    });

    const percentage = quiz.total_marks > 0 ? (score / quiz.total_marks) * 100 : 0;

    // Save attempt
    const attemptId = await quizModel.submitAttempt({
      quiz_id: req.params.id,
      student_id: req.session.user.id,
      score,
      total_marks: quiz.total_marks,
      percentage: percentage.toFixed(2)
    });

    // Save answers
    await quizModel.saveAnswers(attemptId, answerData);

    res.redirect(`/student/quizzes/${attemptId}/result`);
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.render('error', { error: 'Error submitting quiz', user: req.session.user });
  }
});

// Quiz Result
router.get('/quizzes/:attemptId/result', async (req, res) => {
  try {
    const attempt = await quizModel.getAttemptDetails(req.params.attemptId);
    if (attempt.student_id != req.session.user.id) {
      return res.render('error', { error: 'Access denied', user: req.session.user });
    }
    const answers = await quizModel.getAttemptAnswers(req.params.attemptId);
    const quiz = await quizModel.findById(attempt.quiz_id);
    const course = await courseModel.findById(quiz.course_id);

    res.render('student/quizResult', {
      user: req.session.user,
      attempt,
      answers,
      quiz,
      course
    });
  } catch (error) {
    console.error('Quiz result error:', error);
    res.render('error', { error: 'Error loading result', user: req.session.user });
  }
});

// My Results
router.get('/results', async (req, res) => {
  try {
    const attempts = await quizModel.getAttemptsByStudent(req.session.user.id);
    res.render('student/results', { user: req.session.user, attempts });
  } catch (error) {
    console.error('Results error:', error);
    res.render('error', { error: 'Error loading results', user: req.session.user });
  }
});

module.exports = router;
