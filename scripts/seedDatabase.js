const db = require('../config/database');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);
    const parentPassword = await bcrypt.hash('parent123', 10);

    // Create Admin
    const [adminResult] = await db.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['admin@school.com', adminPassword, 'System Administrator', 'admin']
    );
    const adminId = adminResult.insertId;
    console.log('✓ Admin user created');

    // Create Teachers
    const [teacher1Result] = await db.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['teacher@school.com', teacherPassword, 'Ms. Lubna', 'teacher']
    );
    const teacher1Id = teacher1Result.insertId;

    const [teacher2Result] = await db.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['teacher2@school.com', teacherPassword, 'Mr. Ahmad Rahman', 'teacher']
    );
    const teacher2Id = teacher2Result.insertId;
    console.log('✓ Teachers created');

    // Create Students
    const [student1Result] = await db.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['student@school.com', studentPassword, 'Ali bin Ahmad', 'student']
    );
    const student1Id = student1Result.insertId;

    const [student2Result] = await db.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['student2@school.com', studentPassword, 'Siti Nurhaliza', 'student']
    );
    const student2Id = student2Result.insertId;

    const [student3Result] = await db.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['student3@school.com', studentPassword, 'Muhammad Hafiz', 'student']
    );
    const student3Id = student3Result.insertId;
    console.log('✓ Students created');

    // Create Parents
    const [parent1Result] = await db.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['parent@school.com', parentPassword, 'Ahmad bin Hassan', 'parent']
    );
    const parent1Id = parent1Result.insertId;

    const [parent2Result] = await db.execute(
      'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['parent2@school.com', parentPassword, 'Fatimah binti Ali', 'parent']
    );
    const parent2Id = parent2Result.insertId;
    console.log('✓ Parents created');

    // Link parents to students
    await db.execute(
      'INSERT INTO parent_student (parent_id, student_id) VALUES (?, ?)',
      [parent1Id, student1Id]
    );
    await db.execute(
      'INSERT INTO parent_student (parent_id, student_id) VALUES (?, ?)',
      [parent2Id, student2Id]
    );
    console.log('✓ Parent-student relationships created');

    // Create Courses
    const [course1Result] = await db.execute(
      'INSERT INTO courses (title, description, teacher_id) VALUES (?, ?, ?)',
      ['Mathematics Year 4', 'Basic mathematics for Year 4 students covering addition, subtraction, multiplication, and division', teacher1Id]
    );
    const course1Id = course1Result.insertId;

    const [course2Result] = await db.execute(
      'INSERT INTO courses (title, description, teacher_id) VALUES (?, ?, ?)',
      ['English Language Year 4', 'English language learning including grammar, vocabulary, and reading comprehension', teacher1Id]
    );
    const course2Id = course2Result.insertId;

    const [course3Result] = await db.execute(
      'INSERT INTO courses (title, description, teacher_id) VALUES (?, ?, ?)',
      ['Science Year 4', 'Introduction to basic science concepts including plants, animals, and the environment', teacher2Id]
    );
    const course3Id = course3Result.insertId;
    console.log('✓ Courses created');

    // Enroll students in courses
    await db.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student1Id, course1Id]);
    await db.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student1Id, course2Id]);
    await db.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student2Id, course1Id]);
    await db.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student2Id, course3Id]);
    await db.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student3Id, course2Id]);
    await db.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student3Id, course3Id]);
    console.log('✓ Student enrollments created');

    // Create Quiz for Course 1
    const [quiz1Result] = await db.execute(
      'INSERT INTO quizzes (course_id, title, description, created_by, total_marks) VALUES (?, ?, ?, ?, ?)',
      [course1Id, 'Mathematics Quiz 1', 'Basic arithmetic operations quiz', teacher1Id, 10]
    );
    const quiz1Id = quiz1Result.insertId;

    // Add questions to Quiz 1
    const questions1 = [
      { q: 'What is 5 + 3?', a: '6', b: '7', c: '8', d: '9', correct: 'C', marks: 2 },
      { q: 'What is 10 - 4?', a: '5', b: '6', c: '7', d: '8', correct: 'B', marks: 2 },
      { q: 'What is 3 × 4?', a: '10', b: '11', c: '12', d: '13', correct: 'C', marks: 2 },
      { q: 'What is 20 ÷ 4?', a: '4', b: '5', c: '6', d: '7', correct: 'B', marks: 2 },
      { q: 'What is 7 + 8?', a: '14', b: '15', c: '16', d: '17', correct: 'B', marks: 2 }
    ];

    for (const q of questions1) {
      await db.execute(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quiz1Id, q.q, q.a, q.b, q.c, q.d, q.correct, q.marks]
      );
    }
    console.log('✓ Quiz 1 created with questions');

    // Create Quiz for Course 2
    const [quiz2Result] = await db.execute(
      'INSERT INTO quizzes (course_id, title, description, created_by, total_marks) VALUES (?, ?, ?, ?, ?)',
      [course2Id, 'English Grammar Quiz', 'Basic English grammar quiz', teacher1Id, 8]
    );
    const quiz2Id = quiz2Result.insertId;

    const questions2 = [
      { q: 'Which word is a noun?', a: 'run', b: 'happy', c: 'book', d: 'quickly', correct: 'C', marks: 2 },
      { q: 'What is the past tense of "go"?', a: 'goed', b: 'went', c: 'gone', d: 'going', correct: 'B', marks: 2 },
      { q: 'Which sentence is correct?', a: 'I am go to school', b: 'I go to school', c: 'I goes to school', d: 'I going to school', correct: 'B', marks: 2 },
      { q: 'What is a synonym for "happy"?', a: 'sad', b: 'angry', c: 'joyful', d: 'tired', correct: 'C', marks: 2 }
    ];

    for (const q of questions2) {
      await db.execute(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quiz2Id, q.q, q.a, q.b, q.c, q.d, q.correct, q.marks]
      );
    }
    console.log('✓ Quiz 2 created with questions');

    // Create some quiz attempts (sample results)
    const [attempt1] = await db.execute(
      'INSERT INTO quiz_attempts (quiz_id, student_id, score, total_marks, percentage) VALUES (?, ?, ?, ?, ?)',
      [quiz1Id, student1Id, 8, 10, 80.00]
    );
    const attempt1Id = attempt1.insertId;

    // Add answers for attempt 1
    const [questions] = await db.execute('SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ?', [quiz1Id]);
    await db.execute('INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)', 
      [attempt1Id, questions[0].id, 'C', questions[0].correct_answer === 'C']);
    await db.execute('INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)', 
      [attempt1Id, questions[1].id, 'B', questions[1].correct_answer === 'B']);
    await db.execute('INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)', 
      [attempt1Id, questions[2].id, 'C', questions[2].correct_answer === 'C']);
    await db.execute('INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)', 
      [attempt1Id, questions[3].id, 'B', questions[3].correct_answer === 'B']);
    await db.execute('INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)', 
      [attempt1Id, questions[4].id, 'B', questions[4].correct_answer === 'B']);

    console.log('✓ Sample quiz attempts created');

    // Create sample attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await db.execute(
      'INSERT INTO attendance (student_id, course_id, date, status, marked_by) VALUES (?, ?, ?, ?, ?)',
      [student1Id, course1Id, today.toISOString().split('T')[0], 'present', teacher1Id]
    );
    await db.execute(
      'INSERT INTO attendance (student_id, course_id, date, status, marked_by) VALUES (?, ?, ?, ?, ?)',
      [student1Id, course1Id, yesterday.toISOString().split('T')[0], 'present', teacher1Id]
    );
    await db.execute(
      'INSERT INTO attendance (student_id, course_id, date, status, marked_by) VALUES (?, ?, ?, ?, ?)',
      [student2Id, course1Id, today.toISOString().split('T')[0], 'present', teacher1Id]
    );
    console.log('✓ Sample attendance records created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('Admin: admin@school.com / admin123');
    console.log('Teacher: teacher@school.com / teacher123');
    console.log('Student: student@school.com / student123');
    console.log('Parent: parent@school.com / parent123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
