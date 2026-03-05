

## Plan: Add/Remove Students from Teacher Classes

### Overview
Add interactive student management to the TeacherClasses page: a multi-select student picker in the "Nova Turma" dialog and add/remove student actions on each class card. All state is local (mock data, no backend).

### Changes

**1. `src/pages/teacher/TeacherClasses.tsx`**

- Convert `mockClassrooms` into local `useState` so additions/removals are reflected live.
- **"Nova Turma" dialog**: Add a multi-select checklist of all available students (`mockLeaderboard`) with `Checkbox` components. On submit, create a new classroom object with the selected `studentIds`.
- **Each class card**: Add two actions:
  - **"Adicionar Aluno" button** (opens a Dialog/Popover with checkboxes of students NOT already in the class). Selecting and confirming adds them to `studentIds`.
  - **Remove button per student row** (small `X` or `Trash2` icon on each student item). Clicking removes that student from the class with an `AnimatePresence` exit animation.
- Use `AlertDialog` for remove confirmation to prevent accidental removals.
- Import `Checkbox`, `UserPlus`, `Trash2` from respective packages.

**2. No other files need changes.** All UI components (`Dialog`, `Checkbox`, `AlertDialog`, `Button`) already exist. Mock data provides the student pool via `mockLeaderboard`.

### UI Details
- Student picker: scrollable list with avatar + name + checkbox, inside a `DialogContent`.
- Remove action: small ghost/destructive icon button on each student row's right side.
- Toast confirmation on add/remove via `sonner`.

