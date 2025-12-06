# Interview Recorder User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Registration](#user-registration)
3. [Creating Interviews](#creating-interviews)
4. [Managing Interviews](#managing-interviews)
5. [Offline Usage](#offline-usage)
6. [Group Collaboration](#group-collaboration)
7. [Data Export](#data-export)
8. [Statistics & Analysis](#statistics--analysis)
9. [FAQ](#faq)
10. [Tips & Tricks](#tips--tricks)

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- At least 50MB free storage space for offline data
- For best experience: Mobile device with touch interface

### First Time Setup
1. **Access the Application**
   - Open your browser and navigate to the Interview Recorder URL
   - The PWA will automatically detect if you want to install it on your device

2. **Initial Load**
   - On first visit, the application will cache resources for offline use
   - Allow any permission prompts for offline functionality

3. **Connection Status Indicator**
   - Green circle: Connected to internet
   - Red circle: Offline mode
   - Connection type displayed (4G, 3G, etc.)

## User Registration

### Creating Your Account
1. Click on "Sign Up" button on the homepage
2. Fill in the registration form:
   - **Full Name**: Enter your complete name as it should appear in reports
   - **Matric Number**: Enter in format like "CSC/2020/001"
   - **Group Code**: Get this from your project supervisor
   - **Password**: Minimum 6 characters with lowercase, uppercase and number
   - **Confirm Password**: Repeat your password

3. Click "Create Account"
4. You will be redirected to the dashboard upon successful registration

### Password Requirements
- At least 6 characters long
- Contains at least one lowercase letter
- Contains at least one uppercase letter
- Contains at least one number
- Example: "Research123"

### Logging In
1. Enter your matric number and password
2. Click "Sign In"
3. If "Remember Me" is checked, you'll stay logged in

## Creating Interviews

### Starting a New Interview
1. From the dashboard, click the "New Interview" button
2. Or navigate to "Interviews" → "New Interview"
3. The interview form has 4 steps:
   - **Step 1**: Select interviewee role
   - **Step 2**: Enter interviewee information
   - **Step 3**: Answer role-specific questions
   - **Step 4**: Review and submit

### Step 1: Role Selection
- Choose from: **Student**, **Class Representative**, or **Lecturer**
- The questions will adapt based on the selected role
- Each role has 9 specific questions designed for that perspective

### Step 2: Interviewee Information
- Enter the interviewee's full name
- Verify the role is correct
- Click "Next" to proceed

### Step 3: Questionnaire
The questions will vary by role:

**For Students:**
- How often do you experience timetable conflicts? (Daily/Weekly/Monthly/Rarely)
- Rate the severity of timetable issues (1-5 scale)
- How are you notified about schedule changes? (Text input)
- How often do you arrive at the wrong venue? (Often/Sometimes/Rarely/Never)
- How much time do you spend searching for changed venues? (Time ranges)
- Have you missed a lecture due to conflicts? (Yes/No)
- Biggest frustration with timetable system? (Text input)
- How do you prefer to receive notifications? (Dropdown)
- Have you experienced double bookings? (Yes/No)

**For Class Reps:**
- Conflict frequency
- Severity rating
- Current notification methods
- Communication methods used
- Notification speed ratings
- Communication challenges
- Percentage of students missing updates
- Desired features for improvement
- Unofficial schedule maintenance

**For Lecturers:**
- Conflict frequency
- Severity rating
- Current notification methods
- Double booking frequency
- Notification advance time
- Conflict resolution process
- Student communication methods
- Percentage of students affected by issues
- Desired system improvements

### Step 4: Review and Submit
- Review all answers before submission
- Click "Edit" to go back and make changes
- Submit to save the interview

## Managing Interviews

### Viewing Interviews
1. Navigate to "Interviews" in the navigation menu
2. All interviews from your group will be displayed
3. Use the filter panel to narrow down results

### Interview Filters
- **Role**: Filter by Student, Class Rep, or Lecturer
- **Date Range**: Select start and end dates
- **Interviewer**: Filter by specific team members
- **Sync Status**: Show only synced, pending, or all interviews
- **Keyword Search**: Search by interviewee name

### Interview Details
1. Click on any interview to view detailed responses
2. See all responses with proper formatting
3. Option to edit (if it's your interview and hasn't been synced)

### Exporting Data
- Use the "Export" button to download data
- Available formats: CSV, JSON, PDF
- Select date range and filters before exporting

## Offline Usage

### Working Offline
1. The app works completely offline once loaded
2. Any interviews created while offline are stored locally
3. Sync status shows "Pending" for unsynced interviews
4. When connection is restored, data syncs automatically

### Offline Indicators
- Red circle in header indicates offline status
- "Offline mode" banner appears at top
- Pending sync count shows in sync panel

### Syncing Data
- Manual sync: Click "Sync Now" button in header
- Automatic sync: Happens when app detects online status
- Successful sync turns status to "Synced"

### Storage Management
- The app intelligently manages storage
- Old synced data can be cleared through settings
- Storage usage shown in the settings panel

## Group Collaboration

### Interview Team Workflows
1. All team members share the same group code
2. Interviews appear to all group members in real-time when synced
3. Each interviewer can see who conducted which interviews
4. Collaborative statistics show team-wide insights

### Managing Team Interviews
- Filter by "My Interviews" to see your contributions
- Filter by other team members to review their work
- Use the leaderboard to see interview completion rates
- Discuss interesting findings with teammates

## Data Export

### Export Formats
1. **CSV**: Best for spreadsheet analysis
2. **JSON**: Best for programmatic processing
3. **PDF**: Best for reports and presentations
4. **Summary Report**: Key insights and trends

### Export Process
1. Go to "Interviews" page
2. Apply filters if you want a subset of data
3. Click "Export" button
4. Select desired format
5. Download file with timestamp

### Export Restrictions
- Only synced interviews are included in exports
- Large datasets may take time to generate
- Files are named with timestamp for easy identification

## Statistics & Analysis

### Dashboard Metrics
- **Total Interviews**: Overall count
- **My Interviews**: Your contribution
- **Pending Sync**: Interviews awaiting upload
- **Last Sync**: Time of last successful sync

### Statistics Page
The Statistics page provides:
- **Role Distribution**: Visual pie chart of interview types
- **Timeline Chart**: Interviews over time
- **Interviewer Performance**: Contribution by team member
- **Response Analysis**: Deep dive by role
- **Key Insights**: Automatically generated observations

### Response Analysis by Role
- **Students**: Conflict frequency, severity ratings, frustrations
- **Class Reps**: Communication effectiveness, miss rates
- **Lecturers**: Double booking frequency, advance notice

## FAQ

### General Questions

**Q: Can I use this app offline?**
A: Yes! The Interview Recorder is designed as an offline-first application. You can create, edit, and view interviews without internet connection. Data syncs automatically when you come online.

**Q: How do I join my research group?**
A: During registration, enter the group code provided by your project supervisor or lead researcher.

**Q: What happens if I lose my internet connection during an interview?**
A: Your progress is automatically saved locally. Complete the interview offline and it will sync when connection is restored.

**Q: Can multiple people use the same device?**
A: It's recommended that each researcher uses their own account for accurate attribution of interviews.

**Q: How secure is my data?**
A: All data is encrypted in transit using HTTPS. Offline data is stored securely on your device. Server data is stored in compliance with institutional privacy policies.

### Technical Questions

**Q: Will my data be lost if I clear browser history?**
A: Yes, clearing browser data will remove offline interviews. Use the export feature regularly to backup important data.

**Q: How much storage space does the app use?**
A: The app is optimized to use minimal space. Typical usage is under 100MB for hundreds of interviews.

**Q: Which browsers are supported?**
A: Modern browsers including Chrome, Firefox, Safari, and Edge. For best experience use the latest versions.

**Q: Can I install this as an app on my phone?**
A: Yes! The Interview Recorder is a Progressive Web App. When you visit the site, you should see an install prompt.

### Sync Questions

**Q: How often does data sync?**
A: Data syncs automatically when:
- You go online after being offline
- You manually click "Sync Now"
- You submit a new interview while online

**Q: What if a sync fails?**
A: Failed syncs remain in the queue and retry automatically. You can also manually retry from the sync panel.

**Q: Can I force a sync?**
A: Yes, click the "Sync Now" button in the header or the sync panel.

## Tips & Tricks

### For Efficient Use
1. **Batch Interviews**: Conduct multiple interviews before going online to reduce sync frequency
2. **Pre-visit Locations**: If interviewing in areas with poor connectivity, download necessary resources beforehand
3. **Check Storage**: Regularly monitor storage in settings to ensure sufficient space
4. **Export Often**: Export data regularly to have backups

### Interview Techniques
1. **Be Clear**: Explain the research purpose to interviewees
2. **Take Notes**: Jot down additional observations in the notes field
3. **Verify Responses**: Confirm critical information during the interview
4. **Follow Up**: Use the edit feature if you notice errors later

### Navigation Shortcuts
- Use the "Interviews" link to quickly access your list
- Sync panel shows real-time status of your data
- Dashboard gives quick overview of your progress

### Data Quality Tips
1. **Consistent Timing**: Try to conduct similar roles' interviews consistently
2. **Complete Fields**: Ensure all required fields are filled
3. **Cross-reference**: Use the search function to check for duplicate interviews
4. **Regular Reviews**: Check the statistics page regularly for insights

---

For additional help or technical issues, contact your project supervisor or the development team.