

# Navbar — Larger Text & More Polished Layout

## Current State
The navbar uses `text-sm` for links, small buttons, and a simple horizontal layout. The mobile menu is a plain list with `text-base` links.

## Changes in `src/pages/LandingPage.tsx` (lines 180-245)

### Desktop Navbar
- Increase link text from `text-sm` to `text-base` with better hover effects (underline animation or color + scale)
- Make the navbar taller: `h-16` → `h-18` or `h-20`
- Add a subtle active indicator (bottom line or background pill on hover)
- Increase button sizes from `size="sm"` to `size="default"`
- Add slight letter-spacing to links for a more premium feel

### Mobile Menu
- Increase link text from `text-base` to `text-lg`
- Add left border accent or icon indicators for each link
- Increase vertical padding between items
- Make buttons full-width and larger (`size="lg"`)
- Add a subtle separator or section styling

### Proposed Desktop Links:
```tsx
<a
  href={link.href}
  className="relative text-base font-semibold text-muted-foreground hover:text-foreground transition-colors
    after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
>
  {link.label}
</a>
```

### Proposed Mobile Menu:
```tsx
<a className="flex items-center gap-3 text-lg font-semibold text-foreground/80 hover:text-foreground py-3 border-b border-border/30">
  {link.label}
</a>
```

**File:** `src/pages/LandingPage.tsx` — Navbar function (lines ~163-245)

