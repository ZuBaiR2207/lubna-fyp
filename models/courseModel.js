const db = require('../config/database');
const { normalizeLevel } = require('../config/primaryLevels');

const courseModel = {
  async create(courseData) {
    const { title, description, teacher_id, primary_level } = courseData;
    const level = normalizeLevel(primary_level);
    const [result] = await db.execute(
      'INSERT INTO courses (title, description, teacher_id, primary_level) VALUES (?, ?, ?, ?)',
      [title, description, teacher_id, level]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT c.*, u.full_name as teacher_name 
       FROM courses c 
       JOIN users u ON c.teacher_id = u.id 
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  },

  async getAll() {
    const [rows] = await db.execute(
      `SELECT c.*, u.full_name as teacher_name 
       FROM courses c 
       JOIN users u ON c.teacher_id = u.id 
       ORDER BY c.primary_level, c.created_at DESC`
    );
    return rows;
  },

  async getByTeacher(teacherId) {
    const [rows] = await db.execute(
      `SELECT c.*, 
       (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count
       FROM courses c 
       WHERE c.teacher_id = ? 
       ORDER BY c.primary_level, c.created_at DESC`,
      [teacherId]
    );
    return rows;
  },

  async getByStudent(studentId) {
    const [rows] = await db.execute(
      `SELECT c.*, u.full_name as teacher_name 
       FROM courses c 
       JOIN enrollments e ON c.id = e.course_id 
       JOIN users u ON c.teacher_id = u.id
       WHERE e.student_id = ? 
       ORDER BY c.created_at DESC`,
      [studentId]
    );
    return rows;
  },

  async update(id, courseData) {
    const { title, description, primary_level } = courseData;
    const level = normalizeLevel(primary_level);
    await db.execute(
      'UPDATE courses SET title = ?, description = ?, primary_level = ? WHERE id = ?',
      [title, description, level, id]
    );
  },

  async delete(id) {
    await db.execute('DELETE FROM courses WHERE id = ?', [id]);
  },

  async enrollStudent(courseId, studentId) {
    try {
      await db.execute(
        'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
        [studentId, courseId]
      );
      return true;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return false; // Already enrolled
      }
      throw error;
    }
  },

  async getEnrolledStudents(courseId) {
    const [rows] = await db.execute(
      `SELECT u.id, u.full_name, u.email, u.primary_level, e.enrolled_at 
       FROM enrollments e 
       JOIN users u ON e.student_id = u.id 
       WHERE e.course_id = ? 
       ORDER BY u.full_name`,
      [courseId]
    );
    return rows;
  }
};

module.exports = courseModel;
