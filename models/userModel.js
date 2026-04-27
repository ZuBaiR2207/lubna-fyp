const db = require('../config/database');
const bcrypt = require('bcrypt');

const userModel = {
  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT id, email, full_name, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async create(userData) {
    const { email, password, full_name, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, full_name, role]
    );
    return result.insertId;
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  async getAllUsers(role = null) {
    let query = 'SELECT id, email, full_name, role, created_at FROM users';
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
    const { email, full_name, role } = userData;
    await db.execute(
      'UPDATE users SET email = ?, full_name = ?, role = ? WHERE id = ?',
      [email, full_name, role, id]
    );
  },

  async deleteUser(id) {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
  },

  async getStudents() {
    const [rows] = await db.execute(
      'SELECT id, email, full_name, role, created_at FROM users WHERE role = ? ORDER BY full_name',
      ['student']
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
