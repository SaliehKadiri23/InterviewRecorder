# COMPLETE WORK BREAKDOWN STRUCTURE (WBS)
## TIMETABLE INTERVIEW RECORDER PWA
### CSC4301 Requirements Gathering Tool

---

## PROJECT PHASES OVERVIEW
- **Phase 1:** Project Setup & Foundation (Days 1-2)
- **Phase 2:** Authentication with Passport.js (Days 3-4)
- **Phase 3:** Interview Data Models & API (Days 5-6)
- **Phase 4:** Interview Module (Days 7-9)
- **Phase 5:** Group Collaboration & Filtering (Days 10-11)
- **Phase 6:** PWA Features & Offline Functionality (Days 12-14)
- **Phase 7:** Testing & Deployment (Days 15-16)

---

## ✅ PHASE 1: PROJECT SETUP & FOUNDATION (Days 1-2)

### ✅ Task 1.1: Initialize Backend Project
**Duration:** 2 hours  
**Dependencies:** None

**LLM PROMPT:**
```
I'm building a MERN stack PWA for conducting timetable problem interviews. Initialize a Node.js/Express backend project with the following requirements:

1. Create project structure:
   - /src
     - /controllers
     - /models
     - /routes
     - /middleware
     - /config
     - /utils
   - /tests

2. Install dependencies:
   - express, mongoose, dotenv, cors, helmet, compression
   - passport, passport-local, passport-jwt
   - bcryptjs, jsonwebtoken
   - express-validator, express-rate-limit
   - Dev dependencies: nodemon, eslint, prettier

3. Create .env file with:
   - PORT=5000
   - MONGODB_URI=mongodb://localhost:27017/interview-recorder
   - JWT_SECRET=your-secret-key-here
   - JWT_EXPIRE=30d
   - NODE_ENV=development

4. Create server.js with:
   - Express setup
   - MongoDB connection
   - CORS configuration
   - Error handling middleware
   - Basic route returning {"message": "API is running"}

5. Configure ESLint and Prettier
6. Add npm scripts in package.json:
   - "start": "node src/server.js"
   - "dev": "nodemon src/server.js"

Provide the complete folder structure and all configuration files.
```

**Validation Test:**
- Server runs on http://localhost:5000
- Returns `{"message": "API is running"}` on GET /
- MongoDB connects successfully

---

### ✅ Task 1.2: Initialize Frontend Project
**Duration:** 2 hours  
**Dependencies:** None

**LLM PROMPT:**
```
Create a Vite React PWA frontend project for the interview recorder with these requirements:

1. Initialize Vite React project:
   - Use: npm create vite@latest interview-recorder-frontend -- --template react

2. Install core dependencies:
   - react-router-dom
   - axios
   - react-hook-form, zod, @hookform/resolvers
   - dexie, dexie-react-hooks (IndexedDB)
   - date-fns
   - lucide-react (icons)
   - Tailwind CSS: tailwindcss, postcss, autoprefixer

3. Create folder structure:
   /src
     /components
       /common
       /layout
       /interviews
       /auth
     /pages
       /auth
       /interviews
       /dashboard
     /services
     /hooks
     /utils
     /db (IndexedDB setup)
     /assets

4. Configure Tailwind CSS with modern color scheme (blue/indigo theme)

5. Setup Vite PWA plugin:
   - Install vite-plugin-pwa
   - Configure manifest.json with app name, icons, theme color
   - Setup service worker

6. Create basic routing structure with React Router

Provide complete package.json, tailwind.config.js, vite.config.js, and folder structure.
```

**Validation Test:**
- App runs on http://localhost:5173
- Tailwind CSS working
- PWA manifest loads correctly

---

### ✅ Task 1.3: Setup MongoDB Database
**Duration:** 1 hour  
**Dependencies:** Task 1.1

**LLM PROMPT:**
```
Setup MongoDB database for the interview recorder app:

1. Create database connection file (src/config/database.js) with:
   - Mongoose connection logic
   - Connection error handling
   - Connection success logging
   - Graceful shutdown

2. Create these collections (will be populated by models later):
   - users
   - interviews
   - groups

3. Add connection to server.js

4. Test connection with MongoDB Compass or Atlas

Provide the complete database.js file with proper error handling and logging.
```

**Validation Test:**
- Console shows "MongoDB connected"
- Can connect via MongoDB Compass
- No connection errors

---

## PHASE 2: AUTHENTICATION WITH PASSPORT.JS (Days 3-4)

### ✅ Task 2.1: Create User Model
**Duration:** 1.5 hours  
**Dependencies:** Task 1.3

**LLM PROMPT:**
```
Create a User model for the interview recorder with Passport.js local strategy:

File: src/models/User.js

Requirements:
1. User Schema with fields:
   - matricNumber: String, unique, required, uppercase (e.g., "CSC/2020/001")
   - password: String, required, hashed
   - fullName: String, required
   - groupCode: String, required (e.g., "GROUP1")
   - role: String, default: "interviewer"
   - createdAt: Date
   - lastLogin: Date

2. Pre-save hook to hash password using bcryptjs (salt rounds: 10)

3. Instance method: comparePassword(candidatePassword)
   - Returns boolean after comparing with bcrypt

4. Indexes:
   - matricNumber (unique)
   - groupCode (for filtering)

5. Validation:
   - matricNumber must match format: /^[A-Z]{3}\/\d{4}\/\d{3}$/
   - Password minimum 6 characters
   - groupCode required

Do NOT hash password if it's already hashed (check if password is modified).

Provide complete User model with all validations and methods.
```

**Validation Test:**
- Can create user in MongoDB
- Password is hashed (not plain text)
- matricNumber is unique
- comparePassword method works

---

### ✅ Task 2.2: Setup Passport.js Local Strategy
**Duration:** 2 hours  
**Dependencies:** Task 2.1

**LLM PROMPT:**
```
Configure Passport.js with local strategy for the interview recorder:

File: src/config/passport.js

Requirements:
1. Configure Passport Local Strategy:
   - Use matricNumber as username field (not email)
   - Verify user exists
   - Compare password using user.comparePassword()
   - Return user object or error

2. Configure Passport JWT Strategy:
   - Extract JWT from Authorization header (Bearer token)
   - Verify token with JWT_SECRET
   - Find user by ID from token payload
   - Return user or error

3. Serialize and deserialize user (for session support if needed)

4. Export configured passport

Also create: src/middleware/auth.js
- protect: Middleware to verify JWT token
- Returns 401 if no token or invalid token
- Attaches req.user to request

Provide complete passport.js config and auth.js middleware.
```

**Validation Test:**
- Passport initializes without errors
- Local strategy configured
- JWT strategy configured
- Auth middleware protects routes

---

### ✅ Task 2.3: Create Auth Controllers
**Duration:** 3 hours  
**Dependencies:** Task 2.2

**LLM PROMPT:**
```
Create authentication controllers for signup and login:

File: src/controllers/authController.js

Implement these endpoints:

1. **POST /api/auth/signup**
   - Validates: matricNumber, password, fullName, groupCode
   - Check if matricNumber already exists
   - Hash password (done by model)
   - Create user
   - Generate JWT token (payload: userId, matricNumber, groupCode)
   - Return: { success: true, token, user: { id, matricNumber, fullName, groupCode } }

2. **POST /api/auth/login**
   - Validates: matricNumber, password
   - Find user by matricNumber
   - Use passport.authenticate('local') OR manually verify password
   - Generate JWT token
   - Update lastLogin
   - Return: { success: true, token, user: { id, matricNumber, fullName, groupCode } }

3. **GET /api/auth/me** (Protected route)
   - Requires JWT authentication
   - Return current user info (exclude password)

4. **POST /api/auth/logout** (Optional)
   - Can be handled client-side by removing token
   - Return success message

Helper function:
- generateToken(userId): Creates JWT with 30d expiry

Include proper error handling:
- 400: Validation errors
- 401: Invalid credentials
- 409: Matric number already exists
- 500: Server errors

Provide complete authController.js with all endpoints and error handling.
```

**Validation Test:**
- POST /api/auth/signup creates user and returns token
- POST /api/auth/login returns token with valid credentials
- POST /api/auth/login returns 401 with invalid credentials
- GET /api/auth/me returns user with valid token

---

### ✅ Task 2.4: Create Auth Routes
**Duration:** 1 hour  
**Dependencies:** Task 2.3

**LLM PROMPT:**
```
Create authentication routes:

File: src/routes/authRoutes.js

Setup routes:
1. POST /api/auth/signup - authController.signup
2. POST /api/auth/login - authController.login
3. GET /api/auth/me - authController.getMe (protected with auth middleware)

Add validation middleware using express-validator:
- Signup: validate matricNumber format, password length, required fields
- Login: validate required fields

Add rate limiting:
- Max 5 signup attempts per hour per IP
- Max 10 login attempts per hour per IP

Import routes in server.js as: app.use('/api/auth', authRoutes)

Provide complete authRoutes.js with validation and rate limiting.
```

**Validation Test:**
- All routes accessible
- Validation errors return properly
- Rate limiting works
- Protected routes require authentication

---

### ✅ Task 2.5: Create Auth Frontend Pages
**Duration:** 4 hours  
**Dependencies:** Task 2.4

**LLM PROMPT:**
```
Create authentication pages for the interview recorder frontend:

**File 1: src/pages/auth/Signup.jsx**

Requirements:
- Form fields:
  - Matric Number (uppercase, format: CSC/2020/001)
  - Full Name
  - Group Code (dropdown: GROUP1-GROUP10)
  - Password
  - Confirm Password
- Use react-hook-form with zod validation
- Password must be 6+ characters
- Passwords must match
- Matric number regex: /^[A-Z]{3}\/\d{4}\/\d{3}$/
- On success: save token to localStorage, redirect to /dashboard
- Show loading state during submission
- Show error messages
- Link to login page
- Modern UI with Tailwind CSS (blue/indigo theme)

**File 2: src/pages/auth/Login.jsx**

Requirements:
- Form fields:
  - Matric Number
  - Password
- Use react-hook-form with zod validation
- On success: save token to localStorage, redirect to /dashboard
- Show loading state
- Show error messages
- Link to signup page
- "Remember me" checkbox (optional)
- Modern UI matching signup page

**File 3: src/services/authService.js**

Create API service with:
- signup(data): POST to /api/auth/signup
- login(data): POST to /api/auth/login
- logout(): Remove token from localStorage
- getCurrentUser(): GET /api/auth/me
- getToken(): Get token from localStorage
- setToken(token): Save token to localStorage
- isAuthenticated(): Check if token exists

**File 4: src/utils/axios.js**

Configure axios instance:
- Base URL: http://localhost:5000
- Auto-attach Authorization header if token exists
- Response interceptor to handle 401 (redirect to login)
- Request interceptor to attach token

Provide all four files with complete implementation, proper error handling, and modern UI.
```

**Validation Test:**
- Can register new user
- Can login with credentials
- Token saves to localStorage
- Redirects to dashboard after login
- Shows validation errors properly
- UI is responsive and modern

---

## PHASE 3: INTERVIEW DATA MODELS & API (Days 5-6)

### ✅ Task 3.1: Create Interview Model
**Duration:** 2 hours  
**Dependencies:** Task 2.1

**LLM PROMPT:**
```
Create Interview model for storing interview responses:

File: src/models/Interview.js

Schema fields:
1. interviewerId: ObjectId, ref: 'User', required
2. interviewerMatricNumber: String, required (for easy querying)
3. groupCode: String, required (for group filtering)
4. intervieweeName: String, required
5. intervieweeRole: String, enum: ['Student', 'Class Rep', 'Lecturer'], required
6. responses: Object, required (flexible structure for different questions)
7. timestamp: Date, default: Date.now
8. synced: Boolean, default: true (for offline sync tracking)
9. createdAt: Date
10. updatedAt: Date

Response structure by role:

**For Students:**
{
  conflictFrequency: String, // "Daily", "Weekly", "Monthly", "Rarely"
  severityRating: Number, // 1-5
  notificationMethod: String,
  arrivedAtWrongVenue: String, // "Often", "Sometimes", "Rarely", "Never"
  timeWastedSearching: String, // "0-15min", "15-30min", "30-60min", "60+min"
  missedLecture: String, // "Yes", "No"
  biggestFrustration: String, // Text
  preferredNotification: String,
  experiencedClash: String // "Yes", "No"
}

**For Class Reps:**
{
  conflictFrequency: String,
  severityRating: Number,
  notificationMethod: String,
  communicationMethod: String, // Text
  notificationSpeed: String, // "Immediately", "Within 1 hour", "1-3 hours", "3+ hours"
  communicationChallenges: String, // Text
  studentsMissUpdates: String, // "0-25%", "25-50%", "50-75%", "75-100%"
  desiredFeatures: String, // Text
  maintainUnofficialSchedule: String // "Yes", "No"
}

**For Lecturers:**
{
  conflictFrequency: String,
  severityRating: Number,
  notificationMethod: String,
  doubleBookingFrequency: String, // "Often", "Sometimes", "Rarely", "Never"
  notificationAdvanceTime: String, // "Same day", "1 day", "2-3 days", "1 week+"
  conflictResolutionProcess: String, // Text
  studentCommunicationMethod: String, // Text
  studentsMissPercentage: String, // "0-25%", "25-50%", "50-75%", "75-100%"
  desiredImprovements: String // Text
}

Indexes:
- { interviewerId: 1, timestamp: -1 }
- { groupCode: 1, intervieweeRole: 1 }
- { groupCode: 1, timestamp: -1 }

Provide complete Interview model with validation and indexes.
```

**Validation Test:**
- Can create interview document
- All fields validate correctly
- Indexes created successfully
- Can query by groupCode and role

---

### ✅ Task 3.2: Create Interview Controllers
**Duration:** 3 hours  
**Dependencies:** Task 3.1

**LLM PROMPT:**
```
Create interview controllers for CRUD operations:

File: src/controllers/interviewController.js

Implement these endpoints:

1. **POST /api/interviews** (Protected)
   - Create new interview
   - Validate intervieweeRole
   - Validate responses based on role
   - Auto-populate interviewerMatricNumber and groupCode from req.user
   - Return created interview

2. **GET /api/interviews** (Protected)
   - Get all interviews for user's group (filter by groupCode)
   - Query params:
     - role: filter by intervieweeRole
     - page: pagination (default: 1)
     - limit: items per page (default: 20)
   - Return paginated interviews with total count

3. **GET /api/interviews/my** (Protected)
   - Get interviews conducted by current user only
   - Support same filters as GET /api/interviews

4. **GET /api/interviews/:id** (Protected)
   - Get single interview by ID
   - Verify interview belongs to user's group
   - Return 404 if not found or wrong group

5. **PUT /api/interviews/:id** (Protected)
   - Update interview
   - Only interviewer who created it can update
   - Return updated interview

6. **DELETE /api/interviews/:id** (Protected)
   - Delete interview
   - Only interviewer who created it can delete
   - Return success message

7. **GET /api/interviews/stats** (Protected)
   - Get statistics for user's group:
     - Total interviews
     - By role breakdown
     - By interviewer breakdown
     - Recent interviews count (last 7 days)

Error handling:
- 400: Validation errors
- 401: Unauthorized
- 403: Forbidden (not your interview/group)
- 404: Interview not found
- 500: Server error

Provide complete interviewController.js with all endpoints, validation, and error handling.
```

**Validation Test:**
- POST creates interview
- GET returns group interviews
- Role filter works
- Stats calculate correctly
- Authorization checks work

---

### ✅ Task 3.3: Create Interview Routes
**Duration:** 1 hour  
**Dependencies:** Task 3.2

**LLM PROMPT:**
```
Create interview routes:

File: src/routes/interviewRoutes.js

Setup routes (all protected with auth middleware):
1. POST /api/interviews - interviewController.createInterview
2. GET /api/interviews - interviewController.getGroupInterviews
3. GET /api/interviews/my - interviewController.getMyInterviews
4. GET /api/interviews/stats - interviewController.getStats
5. GET /api/interviews/:id - interviewController.getInterview
6. PUT /api/interviews/:id - interviewController.updateInterview
7. DELETE /api/interviews/:id - interviewController.deleteInterview

Add validation middleware:
- Validate interview creation (required fields, valid role)
- Validate ID params (must be valid MongoDB ObjectId)

Import in server.js as: app.use('/api/interviews', authMiddleware.protect, interviewRoutes)

Provide complete interviewRoutes.js with validation.
```

**Validation Test:**
- All routes require authentication
- Validation works on POST/PUT
- Routes accessible with valid token

---

## PHASE 4: INTERVIEW MODULE (Days 7-9)

### ✅ Task 4.1: Create Interview Question Sets
**Duration:** 2 hours  
**Dependencies:** None

**LLM PROMPT:**
```
Create question configuration for each interview role:

File: src/utils/interviewQuestions.js

Export three question sets:

**studentQuestions:** Array of question objects
Each question has:
- id: unique identifier
- question: question text
- type: "select", "radio", "textarea", "range"
- options: array (for select/radio)
- required: boolean

Questions for students:
1. How often do you experience timetable conflicts? (select: Daily/Weekly/Monthly/Rarely)
2. Rate the severity of timetable issues (range: 1-5)
3. How are you currently notified about schedule changes? (textarea)
4. How often do you arrive at a hall only to find your lecture has been moved? (select: Often/Sometimes/Rarely/Never)
5. How much time do you spend searching for changed venues? (select: 0-15min/15-30min/30-60min/60+min)
6. Have you ever missed a lecture due to timetable conflicts? (radio: Yes/No)
7. What's your biggest frustration with the current timetable system? (textarea)
8. How do you prefer to receive notifications? (select: Email/SMS/App/WhatsApp)
9. Have you experienced two lectures at the same time? (radio: Yes/No)

**classRepQuestions:** Similar structure for Class Reps (9 questions)
**lecturerQuestions:** Similar structure for Lecturers (9 questions)

Also create helper function:
- getQuestionsByRole(role): Returns appropriate question set

Provide complete interviewQuestions.js with all three question sets.
```

**Validation Test:**
- All question sets export correctly
- getQuestionsByRole returns correct set
- All required fields present

---

### ✅ Task 4.2: Setup IndexedDB for Offline Storage
**Duration:** 3 hours  
**Dependencies:** Task 1.2

**LLM PROMPT:**
```
Setup IndexedDB using Dexie for offline interview storage:

File: src/db/database.js

Requirements:
1. Create Dexie database: 'InterviewRecorderDB'
2. Version 1 schema with tables:
   - interviews: id, intervieweeName, intervieweeRole, responses, timestamp, synced, localId
   - syncQueue: id, action, data, timestamp, retries

3. Create database methods:
   - addInterview(interviewData): Add to local DB
   - getInterviews(filters): Get all local interviews
   - getInterviewById(id): Get single interview
   - updateInterview(id, data): Update interview
   - deleteInterview(id): Delete interview
   - addToSyncQueue(action, data): Queue for sync
   - getSyncQueue(): Get pending syncs
   - clearSyncQueue(): Clear after successful sync
   - markAsSynced(localId): Update synced flag

4. Create sync service:

File: src/services/syncService.js
   - syncPendingInterviews(): Sync all unsynced interviews
   - syncSingleInterview(interview): Sync one interview
   - handleSyncSuccess(localId, serverId): Update local DB
   - handleSyncFailure(localId, error): Track failures

5. Create custom hook:

File: src/hooks/useOnlineStatus.js
   - Track online/offline status
   - Auto-trigger sync when coming online
   - Return: { isOnline, syncNow }

Provide all three files with complete offline functionality.
```

**Validation Test:**
- IndexedDB database created
- Can save interviews offline
- Sync queue tracks pending changes
- Online status detection works

---

### ✅ Task 4.3: Create Interview Form Component
**Duration:** 5 hours  
**Dependencies:** Task 4.1, Task 4.2

**LLM PROMPT:**
```
Create dynamic interview form component:

File: src/components/interviews/InterviewForm.jsx

Requirements:

1. **Component structure:**
   - Step 1: Select interviewee role
   - Step 2: Enter interviewee name
   - Step 3: Dynamic questions based on role
   - Step 4: Review and submit

2. **Features:**
   - Use react-hook-form for form management
   - Dynamically load questions based on selected role
   - Progress indicator showing current step
   - Validation for all required fields
   - Save to IndexedDB (works offline)
   - Auto-save draft every 30 seconds
   - Ability to save and continue later
   - Submit button shows "Save Locally" when offline

3. **Question rendering:**
   - Select: dropdown with options
   - Radio: radio buttons
   - Textarea: large text input
   - Range: slider with labels (1-5)

4. **State management:**
   - Current step
   - Form data
   - Loading state
   - Error state
   - Online/offline status

5. **Actions:**
   - Previous/Next step navigation
   - Save draft (to IndexedDB)
   - Submit interview
   - If online: save to server + IndexedDB
   - If offline: save to IndexedDB only, add to sync queue

6. **UI/UX:**
   - Modern card-based layout
   - Blue/indigo color scheme
   - Progress bar at top
   - Step indicators
   - Offline indicator badge
   - Loading spinner on submit
   - Success message after submission

Provide complete InterviewForm.jsx with all features and modern styling.
```

**Validation Test:**
- Form loads questions dynamically
- All input types render correctly
- Validation works
- Saves offline successfully
- Progress indicator updates
- Can navigate between steps

---

### ✅ Task 4.4: Create Interview List Page
**Duration:** 4 hours  
**Dependencies:** Task 3.2, Task 4.2

**LLM PROMPT:**
```
Create interview list page with filtering:

File: src/pages/interviews/InterviewList.jsx

Requirements:

1. **Display:**
   - List all interviews from user's group
   - Show when offline: merge local + synced interviews
   - Card layout for each interview with:
     - Interviewee name
     - Role badge (color-coded)
     - Timestamp
     - Interviewer matric number
     - Sync status (synced/pending)

2. **Filters:**
   - Filter by role: All/Student/Class Rep/Lecturer
   - Search by interviewee name
   - Sort by: newest first, oldest first
   - Filter by interviewer: All/My Interviews

3. **Actions:**
   - "New Interview" button (navigate to form)
   - "Sync Now" button (shows pending count)
   - Sync progress indicator during sync
   - View interview details (modal or new page)
   - Delete interview (only own interviews)

4. **Sync functionality:**
   - Show pending sync count badge
   - "Sync Now" button triggers syncService
   - Show sync progress: "Syncing 3 of 7..."
   - Success message after sync
   - Handle sync errors gracefully

5. **Statistics cards at top:**
   - Total interviews
   - By role breakdown
   - Pending sync count
   - Last sync time

6. **Empty states:**
   - No interviews yet: CTA to create first interview
   - No results: "No interviews match your filters"

7. **Loading states:**
   - Skeleton loaders while fetching
   - Shimmer effect

Provide complete InterviewList.jsx with all features, filtering, and modern UI.
```

**Validation Test:**
- Displays all group interviews
- Filters work correctly
- Sync button triggers sync
- Offline interviews show "pending" badge
- Statistics calculate correctly

---

### ✅ Task 4.5: Create Interview Detail Modal
**Duration:** 2 hours  
**Dependencies:** Task 4.4

**LLM PROMPT:**
```
Create interview detail modal component:

File: src/components/interviews/InterviewDetail.jsx

Requirements:

1. **Display:**
   - Modal overlay (backdrop blur)
   - Interview header:
     - Interviewee name (large)
     - Role badge
     - Timestamp
     - Interviewer info
     - Sync status badge
   
2. **Content sections:**
   - Display all questions and answers
   - Format based on question type:
     - Select/Radio: Show selected option
     - Textarea: Show full text
     - Range: Show number with label (e.g., "4 / 5")
   - Group by question with labels

3. **Actions:**
   - Close button (X)
   - Edit button (if own interview & offline)
   - Delete button (if own interview)
   - Export as PDF button (optional)

4. **Modal behavior:**
   - Click outside to close
   - ESC key to close
   - Smooth fade animation
   - Responsive (full screen on mobile)

Provide complete InterviewDetail.jsx with modal functionality and formatting.
```

**Validation Test:**
- Modal opens on interview click
- Displays all data correctly
- Close functionality works
- Actions available for own interviews
- Responsive on mobile

---

## PHASE 5: GROUP COLLABORATION & FILTERING (Days 10-11)

### ✅ Task 5.1: Create Dashboard Page
**Duration:** 3 hours  
**Dependencies:** Task 3.2

**LLM PROMPT:**
```
Create main dashboard for the interview recorder:

File: src/pages/Dashboard.jsx

Requirements:

1. **Header section:**
   - Welcome message: "Welcome, [User Name]"
   - Group badge: "GROUP [code]"
   - Logout button
   - Offline indicator (if offline)

2. **Statistics cards (4 cards):**
   - Total Interviews: number + icon
   - My Interviews: number + icon
   - Pending Sync: number + icon (pulsing if > 0)
   - Last Sync: time ago (e.g., "2 hours ago")

3. **Quick actions:**
   - "New Interview" button (primary, large)
   - "View All Interviews" button
   - "Sync Now" button (shows if pending > 0)

4. **Role distribution chart:**
   - Show breakdown by role (Student/Class Rep/Lecturer)
   - Use simple bar chart or pie chart
   - Display counts and percentages

5. **Recent activity feed:**
   - Last 5 interviews created (by anyone in group)
   - Show: name, role, timestamp, interviewer
   - "View all" link

6. **Interviewer leaderboard:**
   - Top 5 interviewers in group by interview count
   - Show matric number and count
   - Highlight current user

7. **Sync status panel:**
   - If online: "All synced ✓"
   - If pending: "X interviews pending sync"
   - Last sync timestamp
   - "Sync Now" action

Provide complete Dashboard.jsx with all sections, charts, and modern UI.
```

**Validation Test:**
- Dashboard loads all data
- Statistics calculate correctly
- Charts display properly
- Recent activity updates
- Leaderboard ranks correctly

---

### ✅ Task 5.2: Implement Advanced Filtering
**Duration:** 2 hours  
**Dependencies:** Task 4.4

**LLM PROMPT:**
```
Enhance interview list with advanced filtering:

File: src/components/interviews/FilterPanel.jsx

Create reusable filter component with:

1. **Filter options:**
   - Role filter: checkboxes for Student/Class Rep/Lecturer
   - Interviewer filter: dropdown (All/My Interviews/Select specific)
   - Date range: from date - to date
   - Sync status: All/Synced/Pending

2. **Search:**
   - Search by interviewee name
   - Debounced search (300ms delay)
   - Clear search button

3. **Sort:**
   - Dropdown: Newest first/Oldest first/Name A-Z/Name Z-A

4. **UI:**
   - Collapsible filter panel (mobile)
   - Always visible sidebar (desktop)
   - Active filter count badge
   - "Clear all filters" button
   - Apply/Reset buttons

5. **State management:**
   - Filter state management
   - URL params for filters (bookmark-able)
   - LocalStorage to remember preferences

6. **Actions:**
   - onChange callback to parent
   - Export filtered results

Also update InterviewList.jsx to use FilterPanel component.

Provide FilterPanel.jsx and updated InterviewList.jsx.
```

**Validation Test:**
- Filters apply correctly
- Multiple filters combine properly
- Search works with debounce
- Sort options work
- Filter preferences persist

---

### ✅ Task 5.3: Create Export Functionality
**Duration:** 2 hours  
**Dependencies:** Task 5.2

**LLM PROMPT:**
```
Implement interview data export:

File: src/utils/exportUtils.js

Create export functions:

1. **exportToCSV(interviews):**
   - Convert interviews array to CSV format
   - Columns: Interviewee Name, Role, Interviewer, Timestamp, All Q&A
   - Flatten responses object to columns
   - Handle special characters and commas
   - Download as file: "interviews_[date].csv"

2. **exportToJSON(interviews):**
   - Pretty print JSON
   - Download as file: "interviews_[date].json"

3. **exportToPDF(interviews):** (using jsPDF)
   - Create formatted PDF report
   - Include group statistics
   - Table of all interviews
   - Download as file: "interviews_[date].pdf"

4. **generateSummaryReport(interviews):**
   - Generate analysis summary
   - Count by role
   - Common pain points (text analysis)
   - Frequency analysis
   - Return formatted text

File: src/components/interviews/ExportButton.jsx

Create export dropdown button:
- Dropdown with options: CSV, JSON, PDF, Summary
- Loading state during export
- Success toast after export
- Error handling

Provide exportUtils.js and ExportButton.jsx with all export formats.
```

**Validation Test:**
- CSV exports correctly with all data
- JSON is properly formatted
- PDF generates successfully
- Summary report creates insights

---

### ✅ Task 5.4: Implement Group Statistics Page
**Duration:** 3 hours  
**Dependencies:** Task 3.2

**LLM PROMPT:**
```
Create detailed statistics page for group interviews:

File: src/pages/Statistics.jsx

Requirements:

1. **Overview cards:**
   - Total interviews conducted
   - Total unique interviewees
   - Average interviews per day
   - Most active interviewer

2. **Role distribution:**
   - Pie chart showing Student/Class Rep/Lecturer breakdown
   - Percentage and count for each

3. **Timeline chart:**
   - Line chart showing interviews over time
   - X-axis: dates, Y-axis: interview count
   - Filter by last 7 days/30 days/all time

4. **Interviewer performance:**
   - Bar chart of interviews per interviewer
   - Show matric numbers
   - Sortable

5. **Response analysis by role:**
   
   **For Students:**
   - Conflict frequency chart (pie/bar)
   - Average severity rating
   - Most common frustrations (word cloud or list)
   - Preferred notification methods

   **For Class Reps:**
   - Communication methods breakdown
   - Student miss rate averages
   - Notification speed distribution

   **For Lecturers:**
   - Double booking frequency
   - Average notification advance time
   - Student miss percentage averages

6. **Insights section:**
   - Key findings bullet points
   - Most mentioned issues
   - Recommendations based on data

7. **Export options:**
   - Export all statistics as PDF report
   - Export raw data

8. **Filters:**
   - Date range filter
   - Role filter
   - Interviewer filter

Use chart library: recharts or chart.js

Provide complete Statistics.jsx with all charts and analysis.
```

**Validation Test:**
- All charts render correctly
- Statistics calculate accurately
- Filters update charts
- Insights generate from data
- Export works

---

## PHASE 6: PWA FEATURES & OFFLINE FUNCTIONALITY (Days 12-14)

### ✅ Task 6.1: Configure Service Worker
**Duration:** 3 hours  
**Dependencies:** Task 1.2

**LLM PROMPT:**
```
Configure service worker for full offline functionality:

File: vite.config.js (update PWA plugin)

Requirements:

1. **PWA Manifest:**
   - name: "Interview Recorder - CSC4301"
   - short_name: "Interviewer"
   - description: "Offline interview recorder for timetable problem research"
   - theme_color: "#3b82f6" (blue)
   - background_color: "#ffffff"
   - display: "standalone"
   - icons: 192x192, 512x512 (generate these)
   - start_url: "/"
   - scope: "/"

2. **Service Worker configuration:**
   - workbox precache for app shell
   - Cache strategies:
     - NetworkFirst for API calls
     - CacheFirst for static assets
     - StaleWhileRevalidate for images
   - Offline fallback page
   - Background sync for pending interviews

3. **Caching strategy:**
   - Cache API responses for 5 minutes
   - Cache images for 7 days
   - Cache JS/CSS until new version

4. **Background Sync:**
   - Register sync event: 'sync-interviews'
   - Trigger when coming online
   - Retry failed syncs

File: src/registerSW.js

Create service worker registration:
- Check for updates every 1 hour
- Prompt user for update
- Handle install/activate events
- Show "App updated" notification

File: public/sw.js (if custom SW needed)

Custom service worker with:
- Install event: precache app shell
- Fetch event: implement caching strategies
- Sync event: sync pending interviews
- Message event: handle client messages

Provide updated vite.config.js, registerSW.js, and any custom SW code.
```

**Validation Test:**
- Service worker registers successfully
- App works offline
- Background sync triggers
- Update prompt appears
- Cache strategies work

---

### ✅ Task 6.2: Implement Sync Progress UI
**Duration:** 3 hours  
**Dependencies:** Task 4.2, Task 6.1

**LLM PROMPT:**
```
Create comprehensive sync UI components:

File: src/components/sync/SyncStatus.jsx

Create persistent sync status component:
1. Shows current sync state:
   - Idle: "All synced ✓"
   - Syncing: "Syncing X of Y..." with progress bar
   - Error: "Sync failed" with retry button
   - Offline: "Offline - X pending"

2. Position: fixed bottom-right corner
3. Collapsible/expandable
4. Animations for state changes
5. Click to view sync details

File: src/components/sync/SyncModal.jsx

Detailed sync modal showing:
1. List of pending interviews with:
   - Interviewee name
   - Role
   - Timestamp
   - Sync status (pending/syncing/failed/success)
   - Error message if failed

2. Actions:
   - "Sync All" button
   - "Sync Selected" button
   - Individual retry buttons
   - "Clear Failed" button

3. Statistics:
   - Total pending
   - Currently syncing
   - Failed count
   - Success count

File: src/hooks/useSyncStatus.js

Custom hook that:
- Tracks sync state globally
- Provides sync methods
- Auto-syncs when online
- Returns: { 
    syncStatus, 
    pendingCount, 
    syncNow, 
    syncProgress,
    failedItems,
    retryFailed 
  }

File: src/components/layout/OnlineStatusBanner.jsx

Banner that shows when:
- Going offline: "You're offline. Interviews will be saved locally."
- Coming online: "You're back online! Syncing pending interviews..."
- Auto-dismisses after 5 seconds

Provide all four components with complete sync management UI.
```

**Validation Test:**
- Sync status shows correctly
- Progress updates in real-time
- Failed syncs can be retried
- Online/offline banner appears
- UI is smooth and responsive

---

### ✅ Task 6.3: Implement Install Prompt
**Duration:** 2 hours  
**Dependencies:** Task 6.1

**LLM PROMPT:**
```
Create PWA install prompt:

File: src/components/pwa/InstallPrompt.jsx

Requirements:

1. **Install banner:**
   - Appears at top/bottom of screen
   - Shows only if:
     - PWA not installed
     - User hasn't dismissed (check localStorage)
     - After 30 seconds on site OR after 1 interview completed
   
2. **Banner content:**
   - Icon of app
   - Text: "Install Interview Recorder for offline access"
   - "Install" button (primary)
   - "Maybe later" button (dismiss)
   - Close X button

3. **Install logic:**
   - Listen for beforeinstallprompt event
   - Store prompt event
   - Show custom banner
   - On "Install" click: call prompt.prompt()
   - Handle user choice
   - Track if installed

4. **Post-install:**
   - Hide banner
   - Show success message
   - Update localStorage
   - Track analytics (console.log)

5. **UI variations:**
   - Desktop: banner at top
   - Mobile: banner at bottom (above nav if exists)
   - Smooth slide-in animation

File: src/hooks/useInstallPrompt.js

Custom hook that:
- Captures beforeinstallprompt event
- Provides installApp() function
- Tracks install status
- Returns: { 
    isInstallable, 
    isInstalled, 
    installApp, 
    dismissPrompt 
  }

Provide InstallPrompt.jsx and useInstallPrompt.js with complete install flow.
```

**Validation Test:**
- Install prompt appears appropriately
- Install button works
- App installs successfully
- Prompt doesn't reappear after install/dismiss
- Works on mobile and desktop

---

### ✅ Task 6.4: Add Offline Data Persistence
**Duration:** 3 hours  
**Dependencies:** Task 4.2

**LLM PROMPT:**
```
Enhance offline data persistence and conflict resolution:

File: src/services/offlineService.js

Create comprehensive offline service:

1. **Data persistence methods:**
   - saveInterviewOffline(interviewData): Save with unique localId
   - getOfflineInterviews(): Get all unsynced interviews
   - deleteOfflineInterview(localId): Remove from local DB
   - updateOfflineInterview(localId, data): Update existing

2. **Conflict resolution:**
   - detectConflict(localData, serverData): Check for conflicts
   - resolveConflict(strategy, local, server): Merge strategies:
     - 'use-local': Keep local version
     - 'use-server': Keep server version
     - 'merge': Combine both (timestamps, etc.)
   - Default: server wins, but show user notification

3. **Sync queue management:**
   - addToQueue(action, data): Add create/update/delete
   - processQueue(): Process in order
   - removeFromQueue(id): Remove after success
   - retryQueue(): Retry all failed

4. **Data validation:**
   - validateInterview(data): Check required fields
   - sanitizeData(data): Clean before sync
   - checkDataIntegrity(): Verify IndexedDB data

5. **Storage management:**
   - getStorageSize(): Check IndexedDB usage
   - clearOldData(days): Remove old synced interviews
   - exportBackup(): Export all data as JSON
   - importBackup(json): Restore from backup

File: src/components/settings/OfflineSettings.jsx

Create settings page for offline functionality:
- Toggle auto-sync (on/off)
- Sync interval (manual/5min/15min/30min)
- Storage usage indicator
- Clear cached data button
- Export/Import backup
- Conflict resolution preference

Provide offlineService.js and OfflineSettings.jsx with complete offline management.
```

**Validation Test:**
- Data persists offline
- Sync queue processes correctly
- Conflicts resolve appropriately
- Storage management works
- Backup/restore functions

---

### ✅ Task 6.5: Create Progressive Enhancement Features
**Duration:** 2 hours  
**Dependencies:** Task 6.1

**LLM PROMPT:**
```
Add progressive enhancement features:

File: src/components/layout/AppLayout.jsx

Main layout with:

1. **Network status indicator:**
   - Small indicator in header
   - Green dot: online
   - Red dot: offline
   - Show connection speed (if available)

2. **Update available notification:**
   - Toast notification when new version available
   - "Update now" button
   - "Later" button
   - Auto-update on close

3. **Loading states:**
   - Skeleton loaders for data
   - Shimmer effects
   - Progressive loading (show cached, then update)

4. **Error boundaries:**
   - Catch JS errors
   - Show friendly error page
   - "Report issue" button
   - Reload button

File: src/components/common/ErrorBoundary.jsx

React error boundary:
- Catch component errors
- Log to console
- Show fallback UI
- Allow recovery

File: src/utils/networkUtils.js

Network utility functions:
- getNetworkStatus(): Check online/offline
- getConnectionSpeed(): Detect 2G/3G/4G/5G
- isSlowConnection(): Check if slow
- waitForOnline(): Promise that resolves when online

File: src/hooks/useNetworkStatus.js

Custom hook:
- Track online/offline
- Track connection type
- Auto-sync when online
- Returns: { 
    isOnline, 
    connectionType, 
    isSlowConnection,
    effectiveType 
  }

Provide all files with progressive enhancement features.
```

**Validation Test:**
- Network status updates correctly
- Update notifications work
- Error boundaries catch errors
- Loading states show properly
- Works on slow connections

---

## PHASE 7: TESTING & DEPLOYMENT (Days 15-16)

### ✅ Task 7.1: Create User Documentation
**Duration:** 2 hours  
**Dependencies:** All previous tasks

**LLM PROMPT:**
```
Create comprehensive user documentation:

File: README.md (in frontend directory)

Include:

1. **Project Overview:**
   - Purpose: CSC4301 requirements gathering tool
   - Problem: Timetable conflicts and venue management
   - Solution: Offline interview recorder

2. **Features:**
   - Offline-first functionality
   - Role-based questionnaires
   - Group collaboration
   - Data export
   - Statistics and analysis

3. **Installation:**
   - Prerequisites (Node.js, npm)
   - Clone repository
   - Install dependencies
   - Environment setup
   - Run locally

4. **Usage Guide:**
   - Sign up with matric number
   - Create new interview
   - View group interviews
   - Filter and search
   - Sync data
   - Export results

5. **Technical Stack:**
   - Frontend: React, Vite, Tailwind CSS
   - Backend: Node.js, Express, MongoDB
   - Authentication: Passport.js
   - Offline: IndexedDB (Dexie)
   - PWA: Workbox

6. **API Documentation:**
   - Base URL
   - Authentication
   - Endpoints list
   - Request/response examples

7. **Troubleshooting:**
   - Common issues
   - Solutions
   - Contact info

File: USER_GUIDE.md

Detailed user guide with:
- Screenshots (placeholder descriptions)
- Step-by-step workflows
- FAQs
- Tips and tricks

File: DEPLOYMENT.md

Deployment guide:
- Backend deployment (Render/Railway/Heroku)
- Frontend deployment (Vercel/Netlify)
- Environment variables
- Database setup (MongoDB Atlas)
- Domain configuration

Provide all three documentation files.
```

**Validation Test:**
- Documentation is clear
- All features covered
- Setup instructions work
- Deployment steps accurate

---

### ✅ Task 7.2: Setup Environment Configuration
**Duration:** 1 hour  
**Dependencies:** Task 7.1

**LLM PROMPT:**
```
Configure environment variables for development and production:

File: backend/.env.example

Create template:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/interview-recorder
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

File: frontend/.env.example

Create template:
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Interview Recorder
VITE_APP_VERSION=1.0.0
```

File: backend/src/config/config.js

Create config module:
```javascript
module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
```

File: frontend/src/config/config.js

Create frontend config:
```javascript
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  appName: import.meta.env.VITE_APP_NAME || 'Interview Recorder',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};
```

File: .gitignore (both frontend and backend)

Add:
```
node_modules/
.env
.env.local
.env.production
dist/
build/
*.log
.DS_Store
```

Provide all configuration files and examples.
```

**Validation Test:**
- .env.example has all variables
- Config files load correctly
- .gitignore excludes sensitive files
- Works in dev and prod modes

---

### ✅ Task 7.3: Implement Error Handling & Logging
**Duration:** 2 hours  
**Dependencies:** All backend tasks

**LLM PROMPT:**
```
Implement comprehensive error handling and logging:

File: backend/src/middleware/errorHandler.js

Create error handling middleware:
```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { AppError, errorHandler };
```

File: backend/src/middleware/asyncHandler.js

Async error wrapper:
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

File: backend/src/utils/logger.js

Simple logger:
```javascript
const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  },
  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
  }
};

module.exports = logger;
```

Update all controllers to use asyncHandler wrapper and throw AppError for errors.

Provide all error handling files and example of updated controller.
```

**Validation Test:**
- Errors handled gracefully
- Appropriate status codes returned
- Error messages are clear
- Stack traces in development only
- Logs capture important events

---

### ✅ Task 7.4: Backend Deployment Setup
**Duration:** 3 hours  
**Dependencies:** Task 7.2, Task 7.3

**LLM PROMPT:**
```
Prepare backend for deployment:

**Option 1: Render.com**

File: backend/render.yaml

Create Render config:
```yaml
services:
  - type: web
    name: interview-recorder-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 30d
      - key: CORS_ORIGIN
        sync: false
```

**Option 2: Railway**

File: backend/railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**MongoDB Atlas Setup Steps:**

1. Create MongoDB Atlas account
2. Create free cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0) for serverless deployment
5. Get connection string
6. Add to environment variables

File: backend/DEPLOYMENT.md

Create deployment guide:
```markdown
# Backend Deployment Guide

## Prerequisites
- MongoDB Atlas account
- Render.com or Railway account

## Step 1: Setup MongoDB Atlas
1. Go to mongodb.com/atlas
2. Create account/login
3. Create new cluster (free tier)
4. Create database user
5. Network Access: Add 0.0.0.0/0
6. Get connection string

## Step 2: Deploy to Render
1. Connect GitHub repository
2. Create new Web Service
3. Select backend directory
4. Add environment variables:
   - MONGODB_URI: [your atlas connection string]
   - JWT_SECRET: [generate random string]
   - CORS_ORIGIN: [your frontend URL]
5. Deploy

## Step 3: Test Deployment
1. Visit: https://your-app.onrender.com
2. Should see: {"message": "API is running"}
3. Test auth endpoints

## Troubleshooting
[Common issues and solutions]
```

Update backend/package.json:
- Add "engines": { "node": "18.x" }
- Ensure "start" script uses node (not nodemon)

Provide all deployment files and guide.
```

**Validation Test:**
- Backend deploys successfully
- Environment variables set correctly
- MongoDB Atlas connects
- API endpoints accessible
- CORS configured properly

---

### ✅ Task 7.5: Frontend Deployment Setup
**Duration:** 2 hours  
**Dependencies:** Task 7.4

**LLM PROMPT:**
```
Prepare frontend for deployment:

**Option 1: Vercel**

File: frontend/vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Option 2: Netlify**

File: frontend/netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

File: frontend/DEPLOYMENT.md

```markdown
# Frontend Deployment Guide

## Prerequisites
- Backend deployed and URL obtained
- Vercel or Netlify account

## Step 1: Update Environment Variables

Create `.env.production`:
```
VITE_API_URL=https://your-backend.onrender.com
VITE_APP_NAME=Interview Recorder
VITE_APP_VERSION=1.0.0
```

## Step 2: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Add environment variables in dashboard
5. Redeploy

OR use Vercel GitHub integration:
1. Connect repository
2. Select frontend directory
3. Add environment variables
4. Deploy

## Step 3: Deploy to Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Login: `netlify login`
3. Deploy: `netlify deploy --prod`
4. Add environment variables in dashboard

OR use Netlify GitHub integration:
1. Connect repository
2. Configure build settings
3. Add environment variables
4. Deploy

## Step 4: Update Backend CORS

Update backend CORS_ORIGIN to your frontend URL:
- https://your-app.vercel.app

## Step 5: Test PWA Installation

1. Visit deployed URL
2. Check PWA installable
3. Test offline functionality
4. Verify sync works

## Troubleshooting
- API calls failing: Check CORS and API URL
- PWA not installing: Check manifest.json
- Offline not working: Check service worker registration
```

Update frontend/package.json:
- Ensure build script exists: "build": "vite build"
- Add "preview": "vite preview"

Provide all deployment files and guide.
```

**Validation Test:**
- Frontend deploys successfully
- Environment variables work
- API calls connect to backend
- PWA installs correctly
- Offline functionality works
- Sync works in production

---

### ✅ Task 7.6: Create Demo Data & Testing Script
**Duration:** 2 hours  
**Dependencies:** All previous tasks

**LLM PROMPT:**
```
Create demo data and testing scripts:

File: backend/src/scripts/seedData.js

Create seed script:
```javascript
const mongoose = require('mongoose');
const User = require('../models/User');
const Interview = require('../models/Interview');
require('dotenv').config();

const users = [
  {
    matricNumber: 'CSC/2020/001',
    password: 'password123',
    fullName: 'Ahmed Ibrahim',
    groupCode: 'GROUP1'
  },
  {
    matricNumber: 'CSC/2020/002',
    password: 'password123',
    fullName: 'Fatima Hassan',
    groupCode: 'GROUP1'
  },
  {
    matricNumber: 'CSC/2020/003',
    password: 'password123',
    fullName: 'Yusuf Mohammed',
    groupCode: 'GROUP1'
  }
];

const generateInterviews = (userId, matricNumber) => {
  // Generate 5 sample interviews per user
  const interviews = [];
  const roles = ['Student', 'Class Rep', 'Lecturer'];
  const names = ['Aisha', 'Umar', 'Zainab', 'Ibrahim', 'Maryam'];

  for (let i = 0; i < 5; i++) {
    const role = roles[i % 3];
    const responses = generateResponsesByRole(role);
    
    interviews.push({
      interviewerId: userId,
      interviewerMatricNumber: matricNumber,
      groupCode: 'GROUP1',
      intervieweeName: names[i],
      intervieweeRole: role,
      responses,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      synced: true
    });
  }
  
  return interviews;
};

const generateResponsesByRole = (role) => {
  // Return realistic sample responses based on role
  // ... (implement for each role)
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await User.deleteMany({});
    await Interview.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);
    
    // Create interviews
    for (const user of createdUsers) {
      const interviews = generateInterviews(user._id, user.matricNumber);
      await Interview.create(interviews);
    }
    
    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
```

Add to package.json scripts:
```json
"seed": "node src/scripts/seedData.js"
```

File: backend/src/scripts/testAPI.js

Create API testing script using axios:
- Test all endpoints
- Verify authentication
- Check error handling
- Print results

File: frontend/src/utils/testData.js

Export sample data for frontend testing:
- Sample interviews
- Sample users
- Helper functions to populate IndexedDB

Provide seedData.js, testAPI.js, and testData.js with realistic sample data.
```

**Validation Test:**
- Seed script creates data successfully
- Sample data is realistic
- API test script validates all endpoints
- Frontend test data works

---

### ✅ Task 7.7: Final Integration Testing
**Duration:** 3 hours  
**Dependencies:** All tasks

**LLM PROMPT:**
```
Create comprehensive integration test checklist and perform testing:

File: TESTING_CHECKLIST.md

```markdown
# Integration Testing Checklist

## Authentication Flow
- [ ] User can sign up with matric number
- [ ] Password is hashed in database
- [ ] User can login with credentials
- [ ] Invalid credentials return proper error
- [ ] Token is saved to localStorage
- [ ] Protected routes require authentication
- [ ] Logout clears token and redirects
- [ ] Group code validates on signup

## Interview Creation
- [ ] Can select interviewee role
- [ ] Questions load based on selected role
- [ ] All question types render correctly
- [ ] Form validation works
- [ ] Can save draft (offline)
- [ ] Can submit interview online
- [ ] Can submit interview offline
- [ ] Offline interview added to sync queue
- [ ] Interview appears in list immediately

## Offline Functionality
- [ ] App loads without internet
- [ ] Can create interviews offline
- [ ] Data saves to IndexedDB
- [ ] Offline indicator shows
- [ ] Pending sync count updates
- [ ] Can view offline interviews
- [ ] Service worker caches resources

## Sync Functionality
- [ ] Sync button shows pending count
- [ ] Sync uploads interviews one-by-one
- [ ] Progress bar updates correctly
- [ ] Success interviews marked as synced
- [ ] Failed interviews can retry
- [ ] Auto-sync triggers when online
- [ ] Background sync works

## Interview List & Filtering
- [ ] Shows all group interviews
- [ ] Filter by role works
- [ ] Filter by interviewer works
- [ ] Search by name works
- [ ] Sort options work
- [ ] Pagination works
- [ ] Can view interview details
- [ ] Can delete own interviews

## Dashboard
- [ ] Statistics calculate correctly
- [ ] Charts render properly
- [ ] Recent activity updates
- [ ] Leaderboard ranks correctly
- [ ] Quick actions work

## Statistics Page
- [ ] All charts display data
- [ ] Role distribution accurate
- [ ] Timeline chart updates
- [ ] Response analysis correct
- [ ] Export functionality works
- [ ] Filters update statistics

## Export Functionality
- [ ] CSV export downloads correctly
- [ ] JSON export formats properly
- [ ] PDF export generates
- [ ] Summary report creates insights
- [ ] Filtered exports work

## PWA Features
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Works as standalone app
- [ ] Update prompt shows for new version
- [ ] Offline fallback works

## Cross-Browser Testing
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Mobile Chrome: All features work
- [ ] Mobile Safari: All features work

## Performance
- [ ] Initial load < 3 seconds
- [ ] Lighthouse score > 85
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth animations

## Security
- [ ] Passwords hashed
- [ ] JWT tokens secure
- [ ] CORS configured
- [ ] No XSS vulnerabilities
- [ ] Input sanitization works

## Deployment
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Environment variables set
- [ ] MongoDB Atlas connected
- [ ] Production URLs work
- [ ] HTTPS enabled
```

Perform all tests and document results.

**Validation Test:**
- All checklist items pass
- No critical bugs
- Performance acceptable
- Security verified
- Ready for production

---

## PROJECT COMPLETION SUMMARY

### Total Duration: 16 Days

### Deliverables:
1. ✅ Fully functional offline-first PWA
2. ✅ Backend API with authentication
3. ✅ Role-based interview questionnaires
4. ✅ Group collaboration features
5. ✅ Data export and statistics
6. ✅ PWA installation capability
7. ✅ Complete documentation
8. ✅ Deployed application

### Technologies Used:
- **Frontend:** React 18, Vite, Tailwind CSS, IndexedDB (Dexie), Workbox
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** Passport.js (Local Strategy), JWT
- **PWA:** Service Worker, Web App Manifest, Background Sync
- **Deployment:** Render/Railway (Backend), Vercel/Netlify (Frontend)

### Key Features:
- ✅ Offline-first architecture
- ✅ Real-time sync with progress tracking
- ✅ Role-specific questionnaires (Student/Class Rep/Lecturer)
- ✅ Group collaboration and filtering
- ✅ Comprehensive statistics and analytics
- ✅ Data export (CSV, JSON, PDF)
- ✅ PWA installation and updates
- ✅ Responsive design (mobile & desktop)

### Next Steps for CSC4301 Assignment:
1. Use the tool to conduct interviews
2. Gather 20-30 interviews per group
3. Analyze the data using the statistics page
4. Export data for your report
5. Include screenshots in your assignment
6. Document the findings about timetable problems
7. Propose your timetable management solution based on insights

### Support & Maintenance:
- Monitor sync issues
- Track user feedback
- Fix bugs as they arise
- Update documentation
- Add features as needed

---

## APPENDIX: LLM USAGE TIPS

### For Qwen CLI:
```bash
# Example usage
qwen "$(cat task_prompt.txt)"
```

### For Gemini CLI:
```bash
# Example usage
gemini-cli --prompt "$(cat task_prompt.txt)"
```

### General Tips:
1. Copy the exact prompt for each task
2. Paste into your CLI tool
3. Review the generated code
4. Test before moving to next task
5. Make adjustments as needed
6. Save working versions

### Prompt Engineering:
- Be specific about file names and paths
- Include error handling requirements
- Specify UI/UX details
- Request validation tests
- Ask for complete implementations

---

## END OF WBS

**Good luck with your CSC4301 assignment! May your timetable solution be blessed and successful. Bismillah!** 🚀📱

---