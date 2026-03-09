# UAPS — Dataflow & User Flow Document

> **University Academic Planning System**
> Version: 1.0 · Date: March 2026 · Stack: Next.js 15 · MongoDB · OpenRouter AI

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Data Models & Relationships](#2-data-models--relationships)
3. [Authentication Flow](#3-authentication-flow)
4. [User Flows by Role](#4-user-flows-by-role)
   - 4.1 [Admin / HOD Flow](#41-admin--hod-flow)
   - 4.2 [Principal Flow](#42-principal-flow)
   - 4.3 [Faculty Flow](#43-faculty-flow)
   - 4.4 [Student Flow](#44-student-flow)
5. [Core Feature Dataflows](#5-core-feature-dataflows)
   - 5.1 [AI Plan Generation](#51-ai-plan-generation)
   - 5.2 [Timetable Management](#52-timetable-management)
   - 5.3 [Topic Completion & Auto-Rescheduling](#53-topic-completion--auto-rescheduling)
   - 5.4 [Analytics Pipeline](#54-analytics-pipeline)
   - 5.5 [User Invitation Flow](#55-user-invitation-flow)
   - 5.6 [Password Reset Flow](#56-password-reset-flow)
6. [API Reference Map](#6-api-reference-map)
7. [Full End-to-End Data Journey](#7-full-end-to-end-data-journey)

---

## 1. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                          │
│                                                                  │
│  Landing Page  →  Login  →  Role Dashboard  →  Feature Pages    │
│                                                                  │
│  (React Server Components + Client Components where interactive) │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP / fetch
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     NEXT.JS SERVER (App Router)                  │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────────┐  │
│  │ Page (RSC)   │   │ API Routes   │   │  Server Actions     │  │
│  │              │   │ /api/**      │   │  app/actions/       │  │
│  └──────┬───────┘   └──────┬───────┘   └──────────┬──────────┘  │
│         │                  │                       │             │
│  ┌──────▼───────────────────▼───────────────────────▼──────────┐ │
│  │                      lib/auth.ts                            │ │
│  │    JWT (jose) · bcrypt · HTTP-only cookie session           │ │
│  └──────────────────────────┬────────────────────────────────── ┘ │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │                      lib/db.ts                            │  │
│  │                Mongoose + MongoDB Atlas                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  External Services:                                              │
│    OpenRouter AI  (plan generation via OpenAI-compatible SDK)    │
│    Nodemailer     (invite & password reset emails)               │
└──────────────────────────────────────────────────────────────────┘
```

**Key Architectural Rules:**

| Concern | Implementation |
|---|---|
| Auth | JWT stored in `HttpOnly` cookie named `session`, 24h expiry |
| Role guard | Each API route reads `session` cookie and checks `session.role` |
| DB connection | Singleton Mongoose connection via `lib/db.ts` |
| AI | OpenRouter.ai with OpenAI SDK compatibility — model via `OPENROUTER_API_KEY` |
| No middleware file | Auth is enforced per-route and per-page (no global `middleware.ts`) |

---

## 2. Data Models & Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Collections                        │
│                                                                 │
│  CollegeSettings (1 doc — singleton)                            │
│    └── allowedEmailDomains, timing, institution info            │
│                                                                 │
│  Department  ──has──▶  hod_id (User)                            │
│      └──has──▶  subject_ids[ ] (Subject)                        │
│      (faculty & student membership derived via User.department_id)│
│                                                                 │
│  User  (roles: ADMIN · PRINCIPAL · HOD · FACULTY · STUDENT)     │
│      │                                                          │
│      ├── FACULTY ──belongs──▶  department_id (Department)       │
│      │           ──belongs──▶  facultyGroupId (FacultyGroup)    │
│      │                                                          │
│      └── STUDENT ──belongs──▶  department_id (Department)       │
│                   ──belongs──▶  facultyGroupId (FacultyGroup)   │
│                                                                 │
│  Subject                                                        │
│      └── faculty_ids[ ]  (Users qualified to teach it)          │
│                                                                 │
│  FacultyGroup  (= Cohort / Class)                               │
│      ├── department_id                                          │
│      ├── faculty_ids[ ]          (faculty members of cohort)    │
│      ├── subjectAssignments[ ]   ← SINGLE SOURCE OF TRUTH       │
│      │       { subject_id → Subject, faculty_id → User }        │
│      ├── timetable: Map<DayName, Slot[]>                        │
│      │       Slot: { startTime, endTime, room,                  │
│      │               subject_id → Subject,                      │
│      │               faculty_id → User, type }                  │
│      ├── year (1–4), semester (1–8), section                    │
│      └── termStartDate / termEndDate                            │
│      ◆ UNIQUE: (department_id, year, semester, section)         │
│      (student membership derived via User.facultyGroupId)       │
│                                                                 │
│  Plan  (= Teaching Schedule for one Subject + Group)            │
│      ├── faculty_group_id  → FacultyGroup                       │
│      ├── faculty_ids[ ]    → User (supports split syllabus)     │
│      ├── subject_id        → Subject                            │
│      ├── department_id     → Department                         │
│      ├── status: DRAFT | ACTIVE | ARCHIVED                      │
│      └── syllabus_topics[ ]                                     │
│              ├── name, original_duration_mins                   │
│              ├── lecture_sequence (ordered integer)             │
│              ├── priority: CORE | PREREQUISITE | SELF_STUDY     │
│              ├── scheduled_date                                 │
│              ├── assigned_faculty_id  (for split syllabus)      │
│              └── completion_status: PENDING|DONE|MISSED|CONTINUED│
│                                                                 │
│  AcademicCalendar  (one doc per year)                           │
│      ├── year                                                   │
│      ├── holidays[ ] { date, reason }                           │
│      └── working_days_override[ ]                               │
│                                                                 │
│  CalendarEvent                                                  │
│      ├── type: HOLIDAY | EXAM | EVENT | DEADLINE                │
│      ├── date, endDate (range support)                          │
│      ├── createdBy (Principal)                                  │
│      ├── departments[ ]  (empty = all depts)                    │
│      └── facultyGroups[ ] (empty = all groups)                  │
│                                                                 │
│  PasswordResetToken                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Relationship Rules & Design Decisions

| Relationship | Pattern | Rationale |
|---|---|---|
| User → Department | `User.department_id` (ObjectId ref) | Single source of truth; avoids Department arrays getting stale |
| User → FacultyGroup | `User.facultyGroupId` (ObjectId ref) | Single source; group rename doesn't break anything |
| FacultyGroup subjects | `subjectAssignments[]` only | Replaces redundant `subject_ids[]`; encodes both subject + responsible faculty in one place |
| Timetable slots | `subject_id` / `faculty_id` (ObjectId) | No string name fallbacks; all UI display via `.populate()` |
| FacultyGroup unique key | `(department_id, year, semester, section)` composite | Allows groups with same name across depts; prevents accidental duplicates within a cohort |
| Plan teachers | `faculty_ids[]` array | Supports split-syllabus; primary teacher is `faculty_ids[0]` |

---

## 3. Authentication Flow

```
User fills Login Form (/login)
        │
        ▼
POST /api/auth/login
        │
        ├─ Zod validate { email, password }
        ├─ User.findOne({ email }).select('+passwordHash')
        ├─ Check user.isActive
        ├─ bcrypt.compare(password, passwordHash)
        │
        ├─ [FAIL] → 401 Invalid credentials
        │
        └─ [PASS]
             │
             ├─ signJWT({ sub: _id, email, role, name, mustChangePassword })
             ├─ Set cookie: session=<JWT> (HttpOnly, SameSite=lax, 24h)
             ├─ user.lastLogin = now → save()
             │
             ├─ mustChangePassword === true?
             │      YES → redirectUrl = /force-change-password
             │      NO  → redirectUrl based on role:
             │               ADMIN      → /admin
             │               PRINCIPAL  → /dashboard/principal
             │               HOD        → /dashboard/hod
             │               FACULTY    → /dashboard/faculty
             │               STUDENT    → /dashboard/student
             │
             └─ Return { success: true, redirectUrl }
                      │
                      ▼
              Client: router.push(redirectUrl)
```

**Session Lifecycle:**

| Event | Action |
|---|---|
| Login | JWT created, `session` cookie set (24h) |
| Page load (RSC) | `getSession()` reads cookie → `verifyJWT()` |
| API call | Route reads `req.cookies.get('session')` → `verifyJWT()` |
| Logout | `POST /api/auth/logout` → `cookies().delete('session')` |
| Force password change | `mustChangePassword=true` in JWT → redirected to `/force-change-password` |

---

## 4. User Flows by Role

### 4.1 Admin / HOD Flow

```
Login → /dashboard/hod  (or /admin for ADMIN role)
│
├── VIEW: Dashboard Summary
│       ├─ Faculty count, Student count, Subject count, Group count
│       ├─ Avg syllabus completion % (live from Plan aggregation)
│       ├─ Total topics: Done / Missed / Pending
│       └─ Per-year progress breakdown (Year 1–4)
│
├── MANAGE USERS  (/admin/users)
│       ├─ List all users (paginated, filterable by role)
│       ├─ Invite new user → POST /api/admin/invite
│       │     └─ [See Section 5.5 — User Invitation Flow]
│       ├─ Edit user details → POST /api/admin/users
│       └─ Reset user password → POST /api/admin/reset-request
│
├── MANAGE DEPARTMENTS  (/admin/faculty or Principal dashboard)
│       ├─ Create / edit departments
│       ├─ Assign HOD to department
│       └─ POST/PUT /api/admin/departments
│
├── MANAGE SUBJECTS  (/admin/subjects)
│       ├─ Create subjects (name, code, syllabus text)
│       ├─ Assign subjects to faculty groups
│       └─ POST /api/admin/subjects
│
├── MANAGE FACULTY GROUPS  (/admin/faculty)
│       ├─ Create cohort (name, year, semester, section, dept)
│       ├─ Set term dates (termStartDate, termEndDate)
│       ├─ Assign subjects + faculty per subject
│       ├─ Add students to group
│       └─ Actions: faculty.ts server actions
│
├── TIMETABLE EDITOR  (/admin/timetable)
│       ├─ Select Faculty Group
│       ├─ Drag/drop or fill slots per day
│       │     (startTime, endTime, subject, faculty, room, type)
│       ├─ Import from Excel → POST /api/admin/timetable (Excel parser)
│       └─ Save → POST /api/admin/timetable
│             └─ Saves timetable Map, then RECALCULATES all active Plans
│                  for this group (reschedules topics to new slot dates)
│
├── ACADEMIC PLANNER  (/admin/planner)
│       └─ [See Section 5.1 — AI Plan Generation]
│
└── CALENDAR  (/admin/calendar)
        ├─ Create calendar events (holiday, exam, deadline, event)
        ├─ Set date ranges, target dept/group filters
        └─ POST/PUT/DELETE via CalendarManager component
```

---

### 4.2 Principal Flow

```
Login → /dashboard/principal
│
├── VIEW: Institution-wide Dashboard
│       ├─ All stats: Faculty, HODs, Students, Subjects
│       ├─ Aggregate plan progress (all departments)
│       ├─ Departments list with HOD names
│       └─ Per-year analytics chart
│
├── MANAGE DEPARTMENTS
│       ├─ Create / rename departments
│       ├─ Assign / reassign HODs
│       └─ DepartmentManager component → /api/admin/departments
│
├── INSTITUTION SETTINGS  (/dashboard/principal/settings)
│       ├─ Set institution name, contact, address
│       ├─ Set college hours (start/end time, slot duration)
│       ├─ Set allowed email domains for invitations
│       └─ POST /api/admin/settings → CollegeSettings document
│
└── CALENDAR  (shared with HOD/Admin)
        └─ Full CalendarEvent CRUD (applies institution-wide)
```

---

### 4.3 Faculty Flow

```
Login → /dashboard/faculty  (Client Component — fetches on load)
│
│  On mount: GET /api/faculty/dashboard
│       ├─ Read session → get facultyId + facultyName
│       ├─ Find FacultyGroups where faculty_ids contains facultyId
│       ├─ Look up today's timetable slots (by day name)
│       ├─ For each slot: find active Plan for (group + subject)
│       ├─ Find next PENDING topic in that plan
│       └─ Return: { date, schedule[ { slot, subject, group, topic } ] }
│
├── VIEW: Today's Schedule
│       ├─ List of today's lecture slots (time, room, subject, group)
│       └─ Each slot shows: next topic to cover
│
├── MARK TOPIC STATUS  (inline on dashboard)
│       ├─ Faculty picks: DONE | MISSED | CONTINUED
│       └─ POST /api/faculty/dashboard/topic
│             ├─ DONE    → mark topic, no rescheduling needed
│             ├─ MISSED  → mark topic, flag for HOD visibility
│             └─ CONTINUED → duplicate topic inserted after current,
│                            ALL remaining PENDING topics re-dated
│                            [See Section 5.3]
│
├── VIEW SYLLABUS PROGRESS  (/dashboard/faculty → planner links)
│       └─ Visual progress bars per subject (via Plan data)
│
└── SETTINGS  (/settings)
        └─ Change own password → POST /api/auth/change-password
```

---

### 4.4 Student Flow

```
Login → /dashboard/student  (Server Component)
│
│  On render:
│       ├─ Read session cookie → verifyJWT → get userId
│       ├─ User.findById → get facultyGroupId
│       ├─ FacultyGroup.findById.populate('subject_ids')
│       ├─ Get today's timetable slots (first slot = next class)
│       └─ For each subject: find active Plan → compute % done
│
├── VIEW: Dashboard
│       ├─ Next class: time, room, subject, faculty name
│       ├─ Cohort / group name, year, semester
│       └─ Course progress cards (% completion per subject)
│
├── VIEW: Timetable  (/dashboard/student/planner)
│       └─ Full weekly timetable grid (read-only)
│
└── VIEW: Academic Calendar  (/dashboard/student/calendar)
        └─ CalendarEvents filtered for student's dept + group
```

---

## 5. Core Feature Dataflows

### 5.1 AI Plan Generation

```
Admin/HOD navigates to /admin/planner
        │
        ├─ SELECT Faculty Group from dropdown
        │       └─ getAllFacultyGroups() server action → FacultyGroup.find()
        │
        ├─ SELECT Subject
        │
        ├─ UPLOAD Syllabus (PDF or TXT)
        │       └─ POST /api/parse-syllabus
        │               ├─ pdf-parse extracts raw text from PDF
        │               └─ Returns { text: string }
        │
        ├─ EDIT / REVIEW extracted syllabus text
        │
        └─ CLICK "Generate Plan"
                │
                ▼
        POST /api/generate-plan
                │
                ├─ 1. VALIDATE input (Zod: facultyGroupId, syllabusText, subject)
                │
                ├─ 2. FETCH CONTEXT
                │       ├─ FacultyGroup (timetable, termStartDate, termEndDate)
                │       ├─ AcademicCalendar for current year (holidays)
                │       │     └─ Fallback: static INDIAN_HOLIDAYS_2026 if no DB record
                │       └─ CalendarEvent (type=HOLIDAY) → expand date ranges
                │
                ├─ 3. CALCULATE AVAILABLE SLOTS  (utils/availability.ts)
                │       ├─ eachDayOfInterval(termStart → termEnd)
                │       ├─ Skip: Sundays, holidays (DB + static), CalendarEvent holidays
                │       ├─ Filter slots by subject name (from timetable)
                │       └─ Returns: { totalSlots: N, schedule: DaySchedule[] }
                │
                ├─ 4. BUILD AI PROMPT
                │       ├─ Slot budget: "You have N available lecture slots"
                │       ├─ Slot schedule: date-by-date list
                │       ├─ Faculty names list
                │       └─ Syllabus text
                │
                ├─ 5. CALL OpenRouter AI  (OpenAI SDK compatible)
                │       ├─ Model: configured via OPENROUTER_API_KEY
                │       ├─ Structured output enforced (AIPlanResponseSchema)
                │       └─ Returns: { topics: [ { name, duration, date, priority } ] }
                │
                ├─ 6. VALIDATE AI OUTPUT  (Zod: AIPlanResponseSchema)
                │
                ├─ 7. UPSERT PLAN in MongoDB
                │       ├─ Plan.findOneAndUpdate({ faculty_group_id, subject_id })
                │       ├─ status = 'ACTIVE'
                │       └─ syllabus_topics = AI-generated topic list
                │                (each with scheduled_date, sequence, completion_status=PENDING)
                │
                └─ 8. RETURN { plan } to client for preview
```

---

### 5.2 Timetable Management

```
Admin opens /admin/timetable
        │
        ├─ SELECT Faculty Group → GET /api/admin/timetable?id=<groupId>
        │       └─ Returns: FacultyGroup.timetable Map
        │
        ├─ EDIT SLOTS in UI
        │       ├─ Per-day columns (Mon–Sat)
        │       ├─ Each slot: startTime, endTime, subject, faculty, room, type
        │       └─ Option: Import from Excel → /utils/excelParser.ts → parse rows
        │
        └─ SAVE → POST /api/admin/timetable
                │
                ├─ Validate with Zod TimetableUpdateSchema
                ├─ FacultyGroup.findByIdAndUpdate({ timetable })
                │
                └─ RECALCULATE ALL ACTIVE PLANS for this group
                        ├─ Plan.find({ faculty_group_id, status: 'ACTIVE' })
                        ├─ For each plan:
                        │     ├─ calculateAvailableSlots() with new timetable
                        │     └─ Re-assign scheduled_date to each PENDING topic
                        └─ Plan.save() (bulk update)
```

---

### 5.3 Topic Completion & Auto-Rescheduling

```
Faculty marks a topic on their dashboard
        │
        POST /api/faculty/dashboard/topic
        { planId, topicId, status: 'DONE' | 'MISSED' | 'CONTINUED' }
        │
        ├─ DONE
        │       └─ topic.completion_status = 'DONE'
        │          Plan.save() — no rescheduling
        │
        ├─ MISSED
        │       └─ topic.completion_status = 'MISSED'
        │          Plan.save() — flagged for HOD view, no rescheduling
        │
        └─ CONTINUED
                │
                ├─ topic.completion_status = 'CONTINUED'
                │
                ├─ INSERT duplicate topic immediately after:
                │       { name: "<topic> (Continued)", is_split: true,
                │         completion_status: 'PENDING' }
                │
                ├─ RE-NORMALIZE lecture_sequence for all topics
                │
                ├─ FETCH CONTEXT (same as plan generation):
                │       ├─ FacultyGroup (timetable, term dates)
                │       ├─ AcademicCalendar + CalendarEvent holidays
                │       └─ calculateAvailableSlots()
                │
                └─ RE-DATE all PENDING topics
                        ├─ Walk slot schedule from term start
                        ├─ Skip already-completed topics
                        └─ Assign next available slot date to each PENDING topic
                           Plan.save()
```

---

### 5.4 Analytics Pipeline

```
GET /api/analytics  (used by HOD, Principal dashboards)
        │
        ├─ BASIC COUNTS (parallel)
        │       ├─ Faculty, Student, HOD, Subject, Department, Group counts
        │
        ├─ PLAN AGGREGATION (MongoDB $aggregate pipeline)
        │       ├─ $match: { status: 'ACTIVE' }
        │       ├─ $project: total, done, missed per plan
        │       ├─ $addFields: progress = (done/total)*100
        │       └─ Outputs: per-plan progress %
        │
        ├─ DERIVED STATS
        │       ├─ avgProgress = mean(plan.progress)
        │       ├─ totalDone / totalMissed / totalPending
        │       └─ activePlanCount
        │
        ├─ PER-YEAR BREAKDOWN
        │       ├─ FacultyGroup.find().select('year semester name department_id')
        │       ├─ Map plans to groups → bucket by group.year (1–4)
        │       └─ Per year: avgCompletion, groupCount, planCount
        │
        ├─ PER-DEPARTMENT BREAKDOWN
        │       ├─ Map plans to department_id
        │       └─ Per dept: avgCompletion, planCount
        │
        └─ RETURN full analytics payload to dashboard
```

---

### 5.5 User Invitation Flow

```
Admin/HOD/Principal opens Users page
        │
        └─ FILL invite form: email, name, role, dept, mobile, employeeId, etc.
                │
                POST /api/admin/invite
                │
                ├─ Auth check: session.role in [PRINCIPAL, HOD, ADMIN]
                │
                ├─ Zod validate invite payload
                │
                ├─ DOMAIN CHECK
                │       ├─ Load CollegeSettings.allowedEmailDomains
                │       └─ Reject if domain not in allowedEmailDomains (if set)
                │
                ├─ DUPLICATE CHECK → User.findOne({ email })
                │
                ├─ GENERATE temp password (randomBytes → hex string)
                │
                ├─ CREATE User
                │       ├─ passwordHash = bcrypt(tempPassword)
                │       ├─ mustChangePassword = true
                │       ├─ isInvitePending = true
                │       └─ Link to department, facultyGroup if provided
                │
                ├─ UPDATE Department / FacultyGroup membership arrays
                │
                └─ SEND invite email  (lib/email.ts → Nodemailer)
                        ├─ To: user's email
                        └─ Content: temp password + login link
                                │
                                ▼
                        User logs in with temp password
                                │
                        Redirected to /force-change-password
                                │
                        POST /api/auth/change-password
                        (mustChangePassword cleared, isInvitePending = false)
```

---

### 5.6 Password Reset Flow

```
User clicks "Forgot Password" on login page
        │
        POST /api/auth/request-reset  { email }
        │
        ├─ Find User by email
        ├─ Generate reset token (randomBytes)
        ├─ Save PasswordResetToken { userId, token, expiresAt }
        └─ Send reset email with link: /reset-password?token=<token>
                │
                ▼
        User opens reset link → /reset-password
                │
        POST /api/auth/verify-reset  { token, newPassword }
        │
        ├─ PasswordResetToken.findOne({ token })
        ├─ Check token not expired
        ├─ Hash new password → User.save()
        └─ Delete PasswordResetToken
```

---

## 6. API Reference Map

| Method | Route | Who | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | All | Authenticate, set session cookie |
| `POST` | `/api/auth/logout` | All | Delete session cookie |
| `POST` | `/api/auth/change-password` | All (authed) | Change own password |
| `POST` | `/api/auth/request-reset` | Public | Request password reset email |
| `POST` | `/api/auth/verify-reset` | Public | Verify token & set new password |
| `GET` | `/api/analytics` | HOD, Principal | Full institution analytics |
| `GET` | `/api/faculty/dashboard` | Faculty | Today's schedule + next topics |
| `POST` | `/api/faculty/dashboard/topic` | Faculty | Mark topic DONE/MISSED/CONTINUED |
| `POST` | `/api/parse-syllabus` | Admin/HOD | Extract text from PDF/TXT |
| `POST` | `/api/generate-plan` | Admin/HOD | AI-generate a teaching plan |
| `GET` | `/api/admin/timetable` | Admin/HOD | Fetch timetable for a group |
| `POST` | `/api/admin/timetable` | Admin/HOD | Save timetable + recalculate plans |
| `POST` | `/api/admin/invite` | Admin/HOD/Principal | Invite a new user |
| `GET/POST` | `/api/admin/departments` | Admin/Principal | CRUD departments |
| `GET/POST` | `/api/admin/subjects` | Admin/HOD | CRUD subjects |
| `GET/POST` | `/api/admin/faculty` | Admin/HOD | Manage faculty groups |
| `GET/POST` | `/api/admin/users` | Admin | CRUD users |
| `POST` | `/api/admin/settings` | Principal | Update CollegeSettings |
| `GET/POST` | `/api/user` | All (authed) | Get/update own profile |

---

## 7. Full End-to-End Data Journey

The lifecycle of a single academic term from setup to completion:

```
STEP 1 — INSTITUTION SETUP  (Principal)
    ├─ Create Departments
    ├─ Set allowed email domains (CollegeSettings)
    └─ Invite HODs via email

STEP 2 — ACADEMIC STRUCTURE  (HOD/Admin)
    ├─ Create Subjects (with syllabus text)
    ├─ Create Faculty Groups
    │     (year, semester, section, termStartDate, termEndDate)
    ├─ Assign Subjects to Groups
    └─ Invite Faculty + Students via email

STEP 3 — TIMETABLE  (Admin/HOD)
    ├─ Open Timetable Editor → select group
    ├─ Fill weekly slots (or import Excel)
    │     Each slot: day, time, subject, faculty, room
    └─ Save → timetable stored on FacultyGroup

STEP 4 — PLAN GENERATION  (Admin/HOD)
    ├─ Open Academic Planner → select group + subject
    ├─ Upload/paste syllabus PDF
    ├─ AI parses available slots from timetable × term dates × holidays
    ├─ AI generates ordered topic list with scheduled_date per topic
    └─ Plan saved (status=ACTIVE) with all topics as PENDING

STEP 5 — DAILY TEACHING LOOP  (Faculty)
    ├─ Faculty logs in → sees today's schedule
    ├─ For each lecture: sees next PENDING topic
    ├─ After class: marks topic DONE / MISSED / CONTINUED
    │     └─ CONTINUED → system inserts carry-forward topic,
    │                     re-dates all future PENDING topics automatically
    └─ Repeat daily

STEP 6 — MONITORING  (HOD / Principal)
    ├─ Dashboard: live % completion per group/dept/year
    ├─ See MISSED topics flagged → follow up with faculty
    ├─ Analytics: year-wise, dept-wise breakdown
    └─ Take corrective action if coverage is falling behind

STEP 7 — EXAMS / EVENTS  (Principal)
    ├─ Create CalendarEvent (type=EXAM, HOLIDAY, DEADLINE)
    ├─ Target specific depts or groups
    └─ Future plan generations automatically skip these dates

STEP 8 — TERM END  (Admin/HOD)
    └─ Archive completed Plans (status=ARCHIVED)
       Create new FacultyGroups / Plans for next semester
```

---

*Document generated from codebase analysis — March 2026*
