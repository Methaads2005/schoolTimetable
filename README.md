# 🎓 EduSchedule PRO – School Timetable Management System

A complete, responsive, full-stack School Timetable Management System built for schools and academic administrators. It supports manual staff entry, automatic timetable generation using a constraint-satisfaction backtracking algorithm, period splitting across days, laboratory block allocation, automatic teacher substitution with suitability scoring, Class 10/11/12 special test scheduling, morning/evening coaching shifts, and analytical workload reports.

---

## 🌟 Key Features Implemented

### 1. User Roles & Permission Switching
- **Admin**: Full authority to create/edit staff, classes, labs, trigger AI generation, schedule tests, and configure bell schedules.
- **Teacher**: Personalized weekly schedule view, class & room assignments, assigned substitution duties, and shift allocations.
- **Timetable Coordinator**: Staff availability monitoring, conflict resolution, vacant period tracking, and substitution relief management.
- *Instant Role Switcher* accessible directly in the top navigation bar.

### 2. Manual Staff & Faculty Management
- Complete profile fields: Staff ID, Name, Department, Subjects Handled, Eligible Classes, Max Periods/Day, Max Periods/Week, Working Days (Mon–Sat), Morning Shift Availability, Evening Shift Availability, Laboratory Handling Capability, Preferred Periods, Leave/Unavailable Slots, and Active Status.
- Full CRUD operations with search, department filtering, and status filtering.
- **Excel & CSV Import & Export**: One-click export to `.xlsx` and bulk import from files.

### 3. Subject & Classroom Administration
- Custom color tags for visual identification in the timetable grid.
- Separation of Theory, Laboratory/Practical, Sports/Activity, and Special Coaching subjects.
- Class homeroom assignments, student capacity, and class teacher / mentor appointment.

### 4. Automatic Timetable Splitting & Staff Allocation (Core Solver)
- **Period Splitting**: Automatically splits subject quotas (e.g., 6 periods of Math) evenly across available days (1 per day) to prevent study fatigue.
- **Consecutive Lab Blocks**: Automatically identifies practical sessions and pairs them into contiguous 2-period double blocks in assigned labs (e.g., Periods 3 & 4 or 5 & 6).
- **Hard & Soft Constraint Satisfaction**:
  - Zero teacher double-booking.
  - Zero classroom / section double-booking.
  - Zero laboratory double-booking.
  - Honors teacher daily limits (e.g., max 5/day) and weekly caps (e.g., max 24/week).
  - Preserves locked slots configured by administrators.
- **Preview & Overwrite Protection**: Generates candidate schedules for administrative review before committing to the live master database.

### 5. Automatic Substitution & Relief Management
- Detects affected periods when a teacher is marked absent or on leave.
- Evaluates candidate suitability and ranks available free faculty:
  1. **Subject Specialist** (Priority 1)
  2. **Same Department Colleague** (Priority 2)
  3. **Class Eligible Faculty** (Priority 3)
  4. **Workload Fairness** (Favors teachers with fewer scheduled periods that day)
- Instant 1-click confirmation updates the timetable cell and records the entry in the Substitution Register.
- Prevents double-booking substitute teachers.

### 6. Classes 10, 11, and 12 Special Examination Scheduler
- Dedicated exam scheduler for senior board classes: Unit Tests, Weekly Tests, Revision Tests, Model Exams / Pre-Boards, and Practical Exams.
- Assigns invigilators with conflict checking.
- Replaces regular periods only on exam days (e.g., replacing Periods 1, 2, 3) without forcing test slots into everyday timetables.
- Printable exam rosters for notice boards.

### 7. Morning and Evening Coaching Shifts
- Independent configurable hours (e.g., Morning: 7:30 AM – 8:30 AM, Evening: 4:30 PM – 5:30 PM).
- Filters faculty by shift opt-in preferences.
- Dedicated shift rosters for competitive entrance prep (JEE / NEET / Foundation).

### 8. Laboratory Management
- Computer Science, Physics, Chemistry, Biology, and STEM & Robotics labs.
- Workstation capacity, apparatus inventory, and assigned instructors.
- Dedicated weekly lab utilization grid.

### 9. Interactive Timetable Grid & Editor
- School timetable sheet layout with days, periods, recess, and lunch breaks.
- Interactive click-to-edit period modal with instant clash warnings.
- Lock/unlock slots, assign rooms/labs, or clear periods.
- High-contrast visual color-coding per subject.

### 10. Conflict Detection & Diagnostic Center
- Continuous real-time validation:
  - Teacher double booking
  - Class double booking
  - Lab collisions
  - Teacher on leave scheduled in class
  - Exceeding daily or weekly workload caps
  - Missing weekly quotas
- Interactive modal with direct remediation suggestions.

### 11. Reports & Analytical Exports
- Teacher-wise weekly workload audit with visual utilization meters.
- Laboratory utilization report.
- Substitution duty register.
- Export to **Excel (`.xlsx`)** and clean **A4 / Landscape Print / PDF styling**.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, SheetJS (`xlsx`)
- **Backend**: Node.js, Express, RESTful API architecture
- **Data Persistence**: JSON Relational Store with transactional file writes and automated initial seed restoration

---

## 🚀 Running the Application Locally

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Start the Backend Server**:
   ```bash
   npm run server
   ```
   *Runs on `http://localhost:5000`*

3. **Start the Vite Frontend**:
   ```bash
   npm run client
   ```
   *Runs on `http://localhost:5174` (or `http://localhost:5173`)*

4. **Or Run Both Concurrently**:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5174/` (or the port shown by Vite).
