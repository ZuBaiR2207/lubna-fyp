# Quick Start Guide

## Prerequisites Check

Before running the application, ensure you have:

1. **Node.js** (v14 or higher) - Download from https://nodejs.org/
2. **MySQL** (v5.7 or higher) - Download from https://dev.mysql.com/downloads/

## Step-by-Step Setup

### 1. Install Node.js (if not installed)
- Download and install Node.js from https://nodejs.org/
- This will also install npm (Node Package Manager)
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Install MySQL (if not installed)
- Download MySQL from https://dev.mysql.com/downloads/
- Install and set a root password
- Make sure MySQL service is running

### 3. Configure Database
- Open `.env` file in the project root
- Update MySQL credentials:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_mysql_password  ← Change this!
  DB_NAME=slms_db
  ```

### 4. Install Dependencies
Open terminal/command prompt in the project directory and run:
```bash
npm install
```

### 5. Set Up Database
Run the automated setup script:
```bash
npm run setup
```

This will:
- Create the database
- Create all tables
- Seed sample data

### 6. Start the Server
```bash
npm start
```

Or for development (with auto-reload):
```bash
npm run dev
```

### 7. Access the Application
Open your browser and go to: **http://localhost:3000**

## Default Login Credentials

After setup, use these credentials to login:

- **Administrator**
  - Email: `admin@school.com`
  - Password: `admin123`

- **Teacher**
  - Email: `teacher@school.com`
  - Password: `teacher123`

- **Student**
  - Email: `student@school.com`
  - Password: `student123`

- **Parent**
  - Email: `parent@school.com`
  - Password: `parent123`

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Reinstall Node.js and restart your terminal

### "Cannot connect to MySQL"
- Check if MySQL service is running
- Verify credentials in `.env` file
- Ensure MySQL is accessible on port 3306

### "Port 3000 already in use"
- Change PORT in `.env` file
- Or stop the application using port 3000

### Database errors
- Make sure MySQL is running
- Check database credentials in `.env`
- Try running setup again: `npm run setup`

## Manual Setup (if automated setup fails)

```bash
# Step 1: Create database
npm run create-db

# Step 2: Create tables
npm run create-tables

# Step 3: Seed data
npm run seed
```

## Need Help?

Refer to:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup instructions
- `PROJECT_SUMMARY.md` - Project overview
