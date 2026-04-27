# Smart Learning Management System (SLMS)

A Web-Based Learning Management System for Private Primary Institutions in Malaysia.

## Features

- **User Roles**: Administrator, Teacher, Student, and Parent (read-only)
- **Course Management**: Upload and organize materials (PDF, documents, images)
- **Assessment Management**: Multiple-choice quizzes with auto-grading
- **Reporting**: Progress and performance reports for teachers and parents
- **Secure Login**: Authentication system for all users

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, EJS
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: bcrypt, Express Sessions

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Setup Steps

1. **Clone or download the repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env`:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=slms_db
     DB_PORT=3306
     PORT=3000
     SESSION_SECRET=your-secret-key-change-this
     ```

4. **Set up the database:**
   ```bash
   npm run setup
   ```
   This will:
   - Create the database
   - Create all required tables
   - Seed sample data

   Alternatively, you can run each step separately:
   ```bash
   npm run create-db      # Create database
   npm run create-tables  # Create tables
   npm run seed          # Seed sample data
   ```

5. **Start the server:**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Open your browser and go to `http://localhost:3000`
   - Use the demo credentials below to login

## Default Login Credentials

- **Administrator**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123
- **Student**: student@school.com / student123
- **Parent**: parent@school.com / parent123

## Project Structure

```
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware (auth, validation)
├── models/          # Database models/queries
├── routes/          # Express routes
├── public/          # Static files (CSS, JS, images)
├── uploads/         # Uploaded course materials
├── views/           # EJS templates
├── scripts/         # Database seeding scripts
└── server.js        # Main application file
```

## License

ISC
