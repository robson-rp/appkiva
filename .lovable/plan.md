

## Plan: Redesign Lesson Cards

### Current State
Lessons are displayed as compact horizontal list items (icon + text in a row). The user wants larger, more visual cards with illustrative images per topic.

### Design

Replace the flat list layout with a **2-column grid of visual cards**. Each card will have:

1. **Top section**: A gradient illustration area (~120px tall) with a large centered emoji icon and a category-themed gradient background (using the existing `LESSON_CATEGORIES` color mapping)
2. **Bottom section**: Title (2 lines max), description (1 line), and metadata row (difficulty badge, duration, points)
3. **Completed overlay**: Green checkmark badge in the corner, subtle opacity reduction
4. **Hover**: Subtle scale (1.02) per the visual identity guidelines

Category-to-gradient mapping:
- saving → green tones
- budgeting → blue tones  
- investing → purple tones
- earning → gold/amber tones
- donating → pink/rose tones

### Changes

| File | Action |
|---|---|
| `src/pages/shared/LearnPage.tsx` | Change layout from `space-y-3` list to `grid grid-cols-2 gap-3`, redesign `LessonCard` with tall visual card layout using category-based gradient backgrounds and large centered icons |

Single file change only. No new dependencies or backend changes needed.

