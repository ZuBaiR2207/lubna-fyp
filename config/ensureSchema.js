const db = require('./database');

/**
 * Ensures primary_level columns exist (for DBs created before migration).
 * Safe to run on every server start.
 */
async function ensurePrimaryLevelColumns() {
  const [userCols] = await db.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'primary_level'`
  );
  if (userCols.length === 0) {
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN primary_level TINYINT UNSIGNED NULL DEFAULT NULL 
      COMMENT 'Primary 1-5 for students' AFTER role
    `);
    console.log('✓ Database: added users.primary_level');
  }

  const [courseCols] = await db.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'primary_level'`
  );
  if (courseCols.length === 0) {
    await db.execute(`
      ALTER TABLE courses 
      ADD COLUMN primary_level TINYINT UNSIGNED NULL DEFAULT NULL 
      COMMENT 'Primary 1-5' AFTER teacher_id
    `);
    console.log('✓ Database: added courses.primary_level');
  }

  await db.execute(
    `UPDATE courses SET primary_level = 4 WHERE primary_level IS NULL`
  );
  await db.execute(
    `UPDATE users SET primary_level = 4 WHERE role = 'student' AND primary_level IS NULL`
  );
}

module.exports = { ensurePrimaryLevelColumns };
