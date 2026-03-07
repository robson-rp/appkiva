

## Problem

The urgent notification banner ("Pedido de exceção ao limite") keeps reappearing after being dismissed because:

1. **`useEffect` re-fires on every render** — `urgentNotif` is an object reference from `.find()`, which creates a new reference each time the query data updates or the component re-renders. This causes the effect to re-trigger, resetting `showBanner` to `true`.

2. **No "dismissed" tracking** — When the user closes the banner (`setShowBanner(false)`), there is no state tracking which urgent notification was already dismissed. The next effect cycle immediately re-shows it.

3. **Realtime subscription compounds the issue** — The notifications query is invalidated on every `INSERT` via the realtime channel, causing frequent re-renders.

## Fix

1. **Track dismissed banner notification ID** — Add a `dismissedBannerId` state. When the user closes the banner, store `urgentNotif.id`. The effect should only show the banner if `urgentNotif.id !== dismissedBannerId`.

2. **Stabilize the `useEffect` dependency** — Use `urgentNotif?.id` (a string) instead of the object reference, so the effect only re-runs when a genuinely new urgent notification appears.

### Changes

**`src/components/NotificationDropdown.tsx`**:
- Add `const [dismissedBannerId, setDismissedBannerId] = useState<string | null>(null)` state
- Change the `useEffect` to depend on `urgentNotif?.id` and skip if `urgentNotif?.id === dismissedBannerId`
- Update the close button to call `setDismissedBannerId(urgentNotif.id)` alongside `setShowBanner(false)`
- Also add `'vault'` to the `NotifType` union and `'budget'` handling (currently `typeConfig` lacks these types)

