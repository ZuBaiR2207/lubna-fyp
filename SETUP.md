# SLMS Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory with the following content:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=slms_db
DB_PORT=3306
PORT=3000
SESSION_SECRET=your-random-secret-key-here
MAX_FILE_SIZE=10485760
```

**Important:** Replace `your_mysql_password` with your actual MySQL root password.

### 3. Run Setup Script
```bash
npm run setup
```

This will automatically:
- Create the database
- Create all tables
- Seed sample data

### 4. Start the Server
```bash
npm start
```

Or for development (with auto-reload):
```bash
npm run dev
```

### 5. Access the Application
Open your browser and navigate to: `http://localhost:3000`

## Default Login Credentials

After running the setup script, you can login with:

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

## Manual Setup (Alternative)

If the automated setup doesn't work, you can set up manually:

### Step 1: Create Database
```bash
npm run create-db
```

### Step 2: Create Tables
```bash
npm run create-tables
```

### Step 3: Seed Data
```bash
npm run seed
```

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running
- Check your MySQL credentials in `.env`
- Verify MySQL is accessible on the specified port (default: 3306)

### Port Already in Use
- Change the `PORT` value in `.env`
- Or stop the application using port 3000

### Module Not Found
- Run `npm install` again
- Ensure you're in the project root directory

### Database Already Exists
- The setup script will skip creating the database if it already exists
- To start fresh, manually drop the database: `DROP DATABASE slms_db;`

## File Uploads

Uploaded files are stored in the `uploads/` directory. Make sure this directory exists and has write permissions.

## Production Deployment

For production deployment:

1. Change `SESSION_SECRET` to a strong random string
2. Set secure cookie options in `server.js` (set `secure: true` for HTTPS)
3. Use environment variables for all sensitive data
4. Set up proper file storage (consider cloud storage for uploads)
5. Configure HTTPS
6. Set up proper database backups

## Support

For issues or questions, refer to the main README.md file.
