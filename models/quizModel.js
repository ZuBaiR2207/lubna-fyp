const db = require('../config/database');

const quizModel = {
  async create(quizData) {
    const { course_id, title, description, created_by, total_marks } = quizData;
    const [result] = await db.execute(
      'INSERT INTO quizzes (course_id, title, description, created_by, total_marks) VALUES (?, ?, ?, ?, ?)',
      [course_id, title, description, created_by, total_marks]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT q.*, c.title as course_title, u.full_name as created_by_name 
       FROM quizzes q 
       JOIN courses c ON q.course_id = c.id 
       JOIN users u ON q.created_by = u.id 
       WHERE q.id = ?`,
      [id]
    );
    return rows[0];
  },

  async getByCourse(courseId) {
    const [rows] = await db.execute(
      `SELECT q.*, 
       (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempt_count
       FROM quizzes q 
       WHERE q.course_id = ? 
       ORDER BY q.created_at DESC`,
      [courseId]
    );
    return rows;
  },

  async getQuestions(quizId) {
    const [rows] = await db.execute(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id',
      [quizId]
    );
    return rows;
  },

  async addQuestion(questionData) {
    const { quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks } = questionData;
    const [result] = await db.execute(
      'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks]
    );
    return result.insertId;
  },

  async updateQuiz(id, quizData) {
    const { title, description, total_marks } = quizData;
    await db.execute(
      'UPDATE quizzes SET title = ?, description = ?, total_marks = ? WHERE id = ?',
      [title, description, total_marks, id]
    );
  },

  async deleteQuiz(id) {
    await db.execute('DELETE FROM quizzes WHERE id = ?', [id]);
  },

  async submitAttempt(attemptData) {
    const { quiz_id, student_id, score, total_marks, percentage } = attemptData;
    const [result] = await db.execute(
      'INSERT INTO quiz_attempts (quiz_id, student_id, score, total_marks, percentage) VALUES (?, ?, ?, ?, ?)',
      [quiz_id, student_id, score, total_marks, percentage]
    );
    return result.insertId;
  },

  async saveAnswers(attemptId, answers) {
    for (const answer of answers) {
      await db.execute(
        'INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)',
        [attemptId, answer.question_id, answer.selected_answer, answer.is_correct]
      );
    }
  },

  async getAttemptsByStudent(studentId, courseId = null) {
    let query = `
      SELECT qa.*, q.title as quiz_title, q.course_id, c.title as course_title 
      FROM quiz_attempts qa 
      JOIN quizzes q ON qa.quiz_id = q.id 
      JOIN courses c ON q.course_id = c.id 
      WHERE qa.student_id = ?
    `;
    const params = [studentId];
    if (courseId) {
      query += ' AND q.course_id = ?';
      params.push(courseId);
    }
    query += ' ORDER BY qa.attempted_at DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  },

  async getAttemptDetails(attemptId) {
    const [rows] = await db.execute(
      `SELECT qa.*, q.title as quiz_title, c.title as course_title 
       FROM quiz_attempts qa 
       JOIN quizzes q ON qa.quiz_id = q.id 
       JOIN courses c ON q.course_id = c.id 
       WHERE qa.id = ?`,
      [attemptId]
    );
    return rows[0];
  },

  async getAttemptAnswers(attemptId) {
    const [rows] = await db.execute(
      `SELECT qa.*, qq.question_text, qq.option_a, qq.option_b, qq.option_c, qq.option_d, qq.correct_answer, qq.marks 
       FROM quiz_answers qa 
       JOIN quiz_questions qq ON qa.question_id = qq.id 
       WHERE qa.attempt_id = ? 
       ORDER BY qq.id`,
      [attemptId]
    );
    return rows;
  },

  async getQuizStatistics(quizId) {
    const [stats] = await db.execute(
      `SELECT 
        COUNT(*) as total_attempts,
        AVG(percentage) as average_score,
        MAX(percentage) as highest_score,
        MIN(percentage) as lowest_score
       FROM quiz_attempts 
       WHERE quiz_id = ?`,
      [quizId]
    );
    return stats[0];
  }
};

module.exports = quizModel;
