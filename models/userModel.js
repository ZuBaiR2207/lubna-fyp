const db = require('../config/database');
const bcrypt = require('bcrypt');
const { normalizeLevel } = require('../config/primaryLevels');

const userModel = {
  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, email, full_name, role, primary_level, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async create(userData) {
    const { email, password, full_name, role, primary_level } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const level = role === 'student' ? normalizeLevel(primary_level) : null;
    const [result] = await db.execute(
      'INSERT INTO users (email, password, full_name, role, primary_level) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, full_name, role, level]
    );
    return result.insertId;
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  async getAllUsers(role = null) {
    let query = 'SELECT id, email, full_name, role, primary_level, created_at FROM users';
    const params = [];
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  },

  async updateUser(id, userData) {
    const { email, full_name, role, primary_level } = userData;
    const level = role === 'student' ? normalizeLevel(primary_level) : null;
    await db.execute(
      'UPDATE users SET email = ?, full_name = ?, role = ?, primary_level = ? WHERE id = ?',
      [email, full_name, role, level, id]
    );
  },

  async deleteUser(id) {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
  },

  async getStudents() {
    const [rows] = await db.execute(
      'SELECT id, email, full_name, role, primary_level, created_at FROM users WHERE role = ? ORDER BY primary_level, full_name',
      ['student']
    );
    return rows;
  },

  async getStudentsByPrimaryLevel(level) {
    const [rows] = await db.execute(
      'SELECT id, email, full_name, role, primary_level, created_at FROM users WHERE role = ? AND primary_level = ? ORDER BY full_name',
      ['student', level]
    );
    return rows;
  },

  async getTeachers() {
    const [rows] = await db.execute(
      'SELECT id, email, full_name, role, created_at FROM users WHERE role = ? ORDER BY full_name',
      ['teacher']
    );
    return rows;
  }
};

module.exports = userModel;
