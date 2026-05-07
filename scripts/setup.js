const mysql = require('mysql2');
const { execSync } = require('child_process');
require('dotenv').config();

console.log('🚀 SLMS Setup Script\n');
console.log('This script will:');
console.log('1. Create the database');
console.log('2. Create all tables');
console.log('3. Seed sample data\n');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    console.log('\nPlease check your .env file and ensure MySQL is running.');
    process.exit(1);
  }
  console.log('✓ Connected to MySQL server');

  const dbName = process.env.DB_NAME || 'slms_db';
  
  connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
    if (err) {
      console.error('❌ Error creating database:', err.message);
      connection.end();
      process.exit(1);
    }
    console.log(`✓ Database '${dbName}' created or already exists`);
    
    connection.query(`USE ${dbName}`, (err) => {
      if (err) {
        console.error('❌ Error selecting database:', err.message);
        connection.end();
        process.exit(1);
      }
      
      console.log('\n📋 Creating tables...');
      // Run createTables script
      try {
        require('./createTables');
        console.log('\n📊 Seeding database with sample data...');
        setTimeout(() => {
          require('./seedDatabase');
        }, 2000);
      } catch (error) {
        console.error('❌ Error:', error.message);
        connection.end();
        process.exit(1);
      }
    });
  });
});
