

## Plan: Enhance "Nova Turma" Dialog Form

### Overview
Expand the existing "Nova Turma" dialog with additional fields to make it a complete classroom creation form, beyond the current name + grade + student picker.

### Changes

**`src/pages/teacher/TeacherClasses.tsx`**

Add new state variables and form fields to the dialog:

- **Descrição** — `Textarea` for a short class description/notes
- **Disciplina** — `Select` dropdown with predefined subjects (Matemática, Português, Ciências, Educação Financeira, etc.)
- **Horário** — `Input` for schedule info (e.g., "Seg/Qua 10h-11h")
- **Ícone** — clickable emoji grid to pick the class icon instead of random assignment

Store these in new state variables (`newClassDesc`, `newClassSubject`, `newClassSchedule`, `newClassIcon`). Include the extra fields in the created classroom object (extend the local type inline or add optional fields).

Add a search/filter `Input` above the student list to quickly find students by name.

Import `Textarea` and `Select` components (already available in the project).

### UI Layout
The dialog will use a two-column grid for shorter fields (grade + subject, schedule + icon) and full-width for name, description, and student picker. Reset all fields on dialog close.

