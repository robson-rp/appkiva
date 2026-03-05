

## Plan: Student Profile Page (Teacher View)

### Overview
Create a new page at `/teacher/student/:studentId` showing an individual student's profile with their financial stats, tasks, achievements, and savings data — accessible by clicking a student row in any class card on TeacherClasses.

### Changes

**1. New file: `src/pages/teacher/TeacherStudentProfile.tsx`**

A dedicated profile page showing:
- **Header**: Student avatar, name, level badge, KivaPoints
- **Stats grid**: Balance, savings rate, tasks completed, KivaPoints
- **Vaults section**: Student's active vaults with progress bars (from `mockVaults` filtered by childId)
- **Tasks section**: Recent tasks (from `mockTasks` filtered by childId) with status indicators
- **Achievements section**: Unlocked achievements (from `mockAchievements` filtered by childId)
- **Transactions section**: Recent transaction history (from `mockTransactions` filtered by childId)
- **Back button**: Navigate back to `/teacher/classes`

Uses `useParams()` to get `studentId`, then looks up the student in `mockLeaderboard` + `mockChildren` for combined data. Follows existing page patterns (motion animations, Card components, gradient hero).

**2. `src/App.tsx`**

Add route: `<Route path="/teacher/student/:studentId" element={<TeacherLayout><TeacherStudentProfile /></TeacherLayout>} />`

**3. `src/pages/teacher/TeacherClasses.tsx`**

Wrap each student row in the class card with a `Link` (or `useNavigate` onClick) pointing to `/teacher/student/{student.childId}`. The row already has hover styles; add a click handler that navigates, keeping the remove button isolated with `stopPropagation`.

### Data Sources
All data comes from existing mock arrays: `mockChildren`, `mockLeaderboard`, `mockTasks`, `mockTransactions`, `mockVaults`, `mockAchievements` — filtered by the student's `childId`.

