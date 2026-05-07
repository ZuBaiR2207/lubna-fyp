/**
 * Adds primary_level to users (students) and courses.
 * Run once: node scripts/migrateAddPrimaryLevels.js
 */
const db = require('../config/database');
require('dotenv').config();

async function migrate() {
  try {
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
      console.log('✓ Added users.primary_level');
    } else {
      console.log('○ users.primary_level already exists');
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
      console.log('✓ Added courses.primary_level');
    } else {
      console.log('○ courses.primary_level already exists');
    }

    await db.execute(
      `UPDATE courses SET primary_level = 4 WHERE primary_level IS NULL`
    );
    await db.execute(
      `UPDATE users SET primary_level = 4 WHERE role = 'student' AND primary_level IS NULL`
    );
    console.log('✓ Backfilled NULL primary_level (default Primary 4 for existing data)');

    console.log('\n✅ Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
