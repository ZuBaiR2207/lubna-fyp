const db = require('../config/database');

const materialModel = {
  async create(materialData) {
    const { course_id, title, file_path, file_type, uploaded_by } = materialData;
    const [result] = await db.execute(
      'INSERT INTO course_materials (course_id, title, file_path, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [course_id, title, file_path, file_type, uploaded_by]
    );
    return result.insertId;
  },

  async getByCourse(courseId) {
    const [rows] = await db.execute(
      `SELECT cm.*, u.full_name as uploaded_by_name 
       FROM course_materials cm 
       JOIN users u ON cm.uploaded_by = u.id 
       WHERE cm.course_id = ? 
       ORDER BY cm.created_at DESC`,
      [courseId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM course_materials WHERE id = ?', [id]);
    return rows[0];
  },

  async delete(id) {
    await db.execute('DELETE FROM course_materials WHERE id = ?', [id]);
  }
};

module.exports = materialModel;
