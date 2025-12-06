# Interview Recorder - CSC4301 Requirements Gathering Tool

## Project Overview

The Interview Recorder is an offline-first Progressive Web Application (PWA) designed for CSC4301 requirements gathering research. It focuses on collecting interview data about timetable problems and challenges faced by students, lecturers, and class representatives at educational institutions.

### Problem Statement
Educational institutions struggle with managing timetable conflicts, venue changes, and communication challenges. The Interview Recorder addresses these issues by providing a reliable offline-first tool for researchers to gather accurate data about these problems from different stakeholder perspectives.

### Solution 
This application enables researchers to conduct interviews with students, class representatives, and lecturers even in areas with poor connectivity. The tool supports role-based questionnaires to collect specific insights from each group and offers real-time synchronization when online.

## Features

- **Offline-first Architecture**: Functions seamlessly without internet connectivity
- **Role-based Questionnaires**: Tailored questions for Students, Class Representatives, and Lecturers
- **Real-time Sync**: Automatic synchronization when connectivity is restored
- **Group Collaboration**: Multiple interviewers can contribute to the same research group
- **Advanced Filtering**: Filter and search through interviews with multiple criteria
- **Data Visualization**: Statistics and trend analysis
- **Export Capabilities**: Export data in multiple formats (CSV, JSON, PDF)
- **Progressive Web App**: Installable on devices with native app feel
- **Cross-platform Compatibility**: Works on mobile, tablet, and desktop devices

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- Git

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/interview-recorder.git
   cd interview-recorder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the frontend directory with the following variables:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_APP_NAME=Interview Recorder
   VITE_APP_VERSION=1.0.0
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:5173`

### Backend Setup (if running locally)
1. Navigate to the backend directory: `cd ../interview-recorder-backend`
2. Create a `.env` file with database and authentication settings:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/interview-recorder
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRE=30d
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```
3. Install and run: `npm install && npm run dev`

## Usage Guide

### Getting Started
1. **Sign Up**: Register with your academic matric number and a strong password
2. **Join Group**: Join your research group using the group code provided by the lead researcher
3. **Verify**: Confirm your account if required by your institution

### Creating Interview
1. Click "New Interview" from the dashboard
2. Select the interviewee role (Student, Class Rep, or Lecturer)
3. Enter the interviewee's name
4. Answer the role-specific questionnaire
5. Review and submit
6. The interview will be saved locally and synced when online

### Managing Interviews
- **View Interviews**: Access the "Interviews" page to view all group interviews
- **Filter**: Use the filter panel to narrow down results by role, date, interviewer, etc.
- **Search**: Use the search functionality to find specific interviews
- **Export**: Export your data in various formats from the export panel

### Offline Usage
1. The app works completely offline once loaded
2. All interviews are saved to local IndexedDB
3. Sync status shows pending interviews
4. When online, data automatically syncs to the server

## Technical Stack

### Frontend
- **Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Offline Storage**: Dexie.js (IndexedDB wrapper)
- **PWA**: Vite PWA Plugin
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

### Offline Capabilities
- **IndexedDB**: For local data persistence
- **Service Worker**: For caching and background sync
- **Background Sync API**: For syncing when online

## API Documentation

### Base URL
`https://[your-domain].com/api`

### Authentication
All authenticated endpoints require an `Authorization: Bearer [token]` header.

#### Auth Endpoints

**POST /api/auth/signup**
Register a new user
```json
{
  "matricNumber": "CSC/2020/001",
  "fullName": "John Doe",
  "groupCode": "GROUP1",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "matricNumber": "CSC/2020/001",
    "fullName": "John Doe",
    "groupCode": "GROUP1"
  }
}
```

**POST /api/auth/login**
Authenticate user
```json
{
  "matricNumber": "CSC/2020/001",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "matricNumber": "CSC/2020/001",
    "fullName": "John Doe",
    "groupCode": "GROUP1"
  }
}
```

#### Interview Endpoints

**POST /api/interviews**
Create new interview
```json
{
  "intervieweeRole": "Student",
  "intervieweeName": "Jane Smith",
  "responses": {
    "conflictFrequency": "Weekly",
    "severityRating": 4,
    "notificationMethod": "Mobile app notifications"
  }
}
```

**GET /api/interviews** 
Get all interviews for user's group
- Query params: `role`, `page`, `limit`, `dateFrom`, `dateTo`

**GET /api/interviews/:id**
Get specific interview

**PUT /api/interviews/:id**
Update specific interview

**DELETE /api/interviews/:id**
Delete specific interview

## Troubleshooting

### Common Issues

**Issue**: App not loading properly
- **Solution**: Clear browser cache and disable service workers temporarily, then reload

**Issue**: Sync not working
- **Solution**: Check internet connection, verify token is valid, ensure server is running

**Issue**: Slow performance on mobile
- **Solution**: Clear browser storage, check device storage space, ensure device meets minimum requirements

**Issue**: Registration/login fails
- **Solution**: Check matric number format, ensure strong password, verify network connectivity

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Contact
For technical support or questions, contact the development team at:
- Email: support@interviewrecorder.edu
- GitHub: [your-username](https://github.com/your-username)

---

© {new Date().getFullYear()} Interview Recorder - CSC4301 Requirements Gathering Tool