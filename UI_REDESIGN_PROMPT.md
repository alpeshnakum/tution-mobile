# Mobile App UI Redesign — Full Prompt for AI Agent

## Your Task

Redesign the entire UI of this React Native / Expo mobile app (`/home/alpesh/alpesh/oac.mobile`) to match the visual design language of the companion web app (`/home/alpesh/alpesh/oac.local`). This is a **visual-only** task — do not change any API calls, hooks, data fetching, business logic, navigation logic, or TypeScript interfaces unless a prop needs to be added to support a UI change.

Read every file before editing it. After all changes, run `npx tsc --noEmit` inside `/home/alpesh/alpesh/oac.mobile` and fix any TypeScript errors introduced by your changes.

---

## Critical Rules (Read Before Touching Any File)

1. **NO emojis anywhere** — not in nav items, empty states, headers, icons, or any UI element. Use SVG icon components (see Step 2).
2. **Light mode only** — this app is light-mode only. Every container, card, screen, and header must have an explicit `backgroundColor` set (via `style={{}}`, not just className) so Android dark mode cannot override it. Do not rely on Tailwind/NativeWind to provide the background — always pair className with `style={{ backgroundColor: '#ffffff' }}` for white surfaces and `style={{ backgroundColor: '#f8fafc' }}` for page backgrounds.
3. **Input text must always be visible** — every `TextInput` must have `style={{ color: '#0f172a' }}` set explicitly, in addition to any className. Placeholder color must be `'#94a3b8'` via `placeholderTextColor` prop.
4. **Update constants/colors.ts FIRST** before touching any screen file.
5. **Remove Tabs completely** — the `<Tabs>` layout must be deleted and replaced with `<Drawer>`. No tab bar, no tabBarStyle, no Tabs.Screen.

---

## Tech Stack

- Expo (expo-router ~6.0.23)
- React Native
- NativeWind (Tailwind CSS class names on RN components)
- react-native-gesture-handler and react-native-reanimated are already installed
- `@react-navigation/drawer` is NOT installed — you must install it first
- `react-native-svg` is available in Expo — use it for all icons

---

## Step 1 — Install Required Packages

Run these before making any code changes:

```
npx expo install @react-navigation/drawer
npx expo install react-native-svg
```

---

## Step 2 — Force Light Mode

Add `"userInterfaceStyle": "light"` to `app.json` inside the `"expo"` object. This is the only allowed change to app.json. It prevents Android/iOS dark mode from inverting colors.

---

## Step 3 — Create SVG Icon Components

Create `components/icons/index.tsx`. This file exports one SVG icon component per module. All icons use a stroke-based design (Lucide-style): `strokeWidth={1.75}`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `fill="none"`. Each component accepts `size?: number` (default 24) and `color?: string` (default `'#0f172a'`).

Icons to create (name → visual concept):

| Export name | Visual |
|-------------|--------|
| `HomeIcon` | House outline with roof triangle and door rectangle |
| `FeesIcon` | Credit card outline with two horizontal lines |
| `AttendanceIcon` | Calendar with a checkmark inside |
| `ResultsIcon` | Bar chart with three ascending bars |
| `LeavesIcon` | Document/file with lines and a clock badge |
| `ProfileIcon` | Circle head + arc shoulders (person silhouette) |
| `NotificationsIcon` | Bell outline |
| `ExamIcon` | Clipboard with lines (checklist) |
| `NoticesIcon` | Megaphone/bullhorn outline |
| `HomeworkIcon` | Open book outline |
| `TimetableIcon` | Grid of 4 squares (2×2) |
| `SignOutIcon` | Rectangle with arrow pointing right out of it (log-out) |
| `MenuIcon` | Three horizontal lines (hamburger), used for drawer open |
| `BackIcon` | Left-pointing arrow (`←` style, `ChevronLeft` or `ArrowLeft`) |
| `ChevronRightIcon` | Single right-pointing chevron `>` |
| `AlertIcon` | Triangle with exclamation mark (for error states) |
| `EmptyBoxIcon` | Open box or inbox outline (for empty states) |
| `CheckCircleIcon` | Circle with checkmark inside |

Implement each using `react-native-svg` (`Svg`, `Path`, `Polyline`, `Circle`, `Line`, `Rect` primitives). Generate clean, readable SVG paths. Do not use emoji or Unicode characters anywhere in place of icons.

Example structure:
```tsx
import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function HomeIcon({ size = 24, color = '#0f172a' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 12L12 3l9 9" />
      <Path d="M9 21V12h6v9" />
      <Rect x="3" y="12" width="18" height="9" rx="1" />
    </Svg>
  );
}
// ... rest of icons
```

---

## Step 4 — Update constants/colors.ts

Update the values to exactly:

```ts
export const Colors = {
  primary:        '#4f46e5',
  primaryLight:   '#eef2ff',
  border:         '#e2e8f0',
  borderLight:    '#f1f5f9',
  text:           '#0f172a',
  textSecondary:  '#475569',
  textMuted:      '#64748b',
  textPlaceholder:'#94a3b8',
  success:        '#16a34a',
  successLight:   '#dcfce7',
  warning:        '#d97706',
  warningLight:   '#fef3c7',
  danger:         '#ef4444',
  dangerLight:    '#fee2e2',
  background:     '#f8fafc',
  surface:        '#ffffff',
};
```

---

## Step 5 — Design System to Apply

### Color palette (use Tailwind class names throughout, never hardcode hex except in `style={{}}` overrides)

- Primary / active:        indigo-600 (bg-indigo-600, text-indigo-600, border-indigo-600)
- Primary light:           indigo-50 (bg-indigo-50)
- Primary muted text:      indigo-500 (text-indigo-500) for links and secondary accents
- Page background:         slate-50 (bg-slate-50)
- Card background:         white (bg-white)
- Border default:          slate-200 (border-slate-200)
- Border light:            slate-100 (border-slate-100)
- Text heading:            slate-900 (text-slate-900)
- Text secondary:          slate-600 (text-slate-600)
- Text muted:              slate-500 (text-slate-500)
- Text placeholder:        slate-400 (text-slate-400)
- Success text/value:      green-600 (text-green-600)
- Success background:      green-50 (bg-green-50), green-100 (bg-green-100)
- Warning text:            amber-600 (text-amber-600)
- Warning background:      amber-50 (bg-amber-50), amber-100 (bg-amber-100)
- Danger text:             red-500 (text-red-500)
- Danger background:       red-50 (bg-red-50), red-100 (bg-red-100)

Only use `Colors` from `constants/colors.ts` inside `style={{}}` props where Tailwind cannot reach (e.g. `ActivityIndicator color`, drawer `drawerActiveTintColor`, `TextInput` text color, explicit background overrides).

### Typography rules

- Page / screen title:  text-xl font-bold text-slate-900
- Section heading:      text-base font-semibold text-slate-900
- Card label:           text-sm font-medium text-slate-700
- Body text:            text-sm text-slate-600
- Caption / meta:       text-xs text-slate-500
- Stat value large:     text-2xl font-bold (color depends on context)
- Link / action text:   text-sm font-medium text-indigo-600

### Card style

```
className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
style={{ backgroundColor: '#ffffff' }}
```

Always include the explicit `backgroundColor` style to prevent dark mode override.

### Badge style (pill shape, soft colored backgrounds)

All badges: `rounded-full px-2.5 py-0.5 text-xs font-medium`
- default:   bg-slate-100 text-slate-700
- primary:   bg-indigo-100 text-indigo-700
- success:   bg-green-100 text-green-700
- warning:   bg-amber-100 text-amber-700
- danger:    bg-red-100 text-red-700

### Button style

- primary:     bg-indigo-600 text-white rounded-xl py-3.5 font-semibold text-base
- outline:     border border-slate-300 bg-white text-slate-700 rounded-xl py-3.5 font-semibold text-base
- ghost:       bg-transparent text-indigo-600 font-medium text-base
- destructive: bg-red-500 text-white rounded-xl py-3.5 font-semibold text-base

Disabled state: opacity-50. Loading spinner: white for primary/destructive, indigo-600 for outline/ghost.

### Input style

Border: border-slate-300 default, border-red-400 when error prop present, border-indigo-400 when focused.
Background: bg-white with explicit `style={{ backgroundColor: '#ffffff' }}`.
Padding: px-4 py-3.5.
Text: always include `style={{ color: '#0f172a' }}` — this is critical for dark mode.
Label: text-sm font-medium text-slate-700 shown above input with mb-1.5 gap.
Error message: text-xs text-red-500 mt-1 shown below input.
`placeholderTextColor="#94a3b8"` on the TextInput element (required prop, not className).

### Screen header style

```
className="bg-white border-b border-slate-200 px-5 pt-4 pb-3"
style={{ backgroundColor: '#ffffff' }}
```
Title: text-xl font-bold text-slate-900
Subtitle: text-sm text-slate-500 mt-0.5
Back arrow: use `BackIcon` from `components/icons`, color `Colors.primary` (#4f46e5), size 24
Hamburger: use `MenuIcon` from `components/icons`, color `#334155` (slate-700), size 24

### List row style (inside cards)

`flex-row items-center justify-between py-3 border-b border-slate-100`
Label: text-sm text-slate-500
Value: text-sm font-medium text-slate-900

### Stat box style (colored background cells)

`rounded-xl p-3 items-center` with explicit backgroundColor style:
- indigo stat: className="bg-indigo-50" style={{ backgroundColor: '#eef2ff' }}, value text-2xl font-bold text-indigo-600
- green stat:  className="bg-green-50" style={{ backgroundColor: '#f0fdf4' }}, value text-2xl font-bold text-green-600
- red stat:    className="bg-red-50" style={{ backgroundColor: '#fef2f2' }}, value text-2xl font-bold text-red-500
- amber stat:  className="bg-amber-50" style={{ backgroundColor: '#fffbeb' }}, value text-2xl font-bold text-amber-500
Label below value: text-xs text-slate-500 mt-1

### Empty state style

`py-16 items-center gap-3`
Icon: use the appropriate SVG icon (e.g. `EmptyBoxIcon`) with size={48} and color="#94a3b8"
Message: text-base text-slate-500

### Error state style

`flex-1 items-center justify-center gap-4`
Icon: `AlertIcon` size={48} color="#ef4444"
Error message: text-sm text-slate-500 text-center
Retry button: Button component with outline variant

### Section divider

`h-px bg-slate-100` (a View with no children, with explicit `style={{ backgroundColor: '#f1f5f9' }}`)

---

## Step 6 — Replace Bottom Tab Bar with Sidebar Drawer

The current `app/(app)/_layout.tsx` uses `<Tabs>`. Delete the entire file content and replace it with a `<Drawer>` from `expo-router/drawer`. The bottom tab bar must be completely gone — no `tabBarStyle: { display: 'none' }` hacks, just no Tabs at all.

### Drawer layout rules

- Drawer slides in from the LEFT
- Width: 280
- `swipeEdgeWidth: 50` (swipe-to-open from left edge)
- Wrap everything in `<GestureHandlerRootView style={{ flex: 1 }}>`
- ALL screens currently listed as `Tabs.Screen` become `Drawer.Screen`
- Screens that are not navigation destinations (change-password, edit-profile, select-child, receipt/[receiptNumber]) get `options={{ drawerItemStyle: { display: 'none' } }}`
- Do NOT render the default drawer items — use a fully custom drawer content component

### Custom drawer content design

The drawer background is white (`style={{ flex: 1, backgroundColor: '#ffffff' }}`). Three sections stacked vertically:

**Section 1 — Header** (`style={{ backgroundColor: '#4f46e5' }}`, `className="px-5 pt-12 pb-6"`):
- 56×56 `rounded-2xl` icon box with `style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}` — contains the `HomeIcon` (or a school/graduation cap SVG icon you define) at size 28, color white
- App name "Student Portal" — text-lg font-bold text-white mt-3
- User's full name — `style={{ color: '#c7d2fe' }}` text-sm (indigo-200 equivalent)
- Role badge: `self-start rounded-full px-2.5 py-0.5 mt-1.5` with `style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}` — text-white text-xs font-medium capitalize

**Section 2 — Navigation items** (scrollable, white background):
`className="flex-1 px-3 py-3"` with `style={{ backgroundColor: '#ffffff' }}`

Nav items in order with their icons:
| Screen route | Label | Icon component |
|---|---|---|
| index | Home | `HomeIcon` |
| fees | Fees | `FeesIcon` |
| attendance | Attendance | `AttendanceIcon` |
| results | Results | `ResultsIcon` |
| leaves | Leaves | `LeavesIcon` |
| homework | Homework | `HomeworkIcon` |
| timetable | Timetable | `TimetableIcon` |
| exams | Exam Schedule | `ExamIcon` |
| notices | Notices | `NoticesIcon` |
| notifications | Notifications | `NotificationsIcon` |
| profile | Profile | `ProfileIcon` |

Each nav item row: `flex-row items-center gap-3 px-3 py-3 rounded-xl mb-0.5`
- **Active item** (current route): `style={{ backgroundColor: '#eef2ff' }}`, label `style={{ color: '#4338ca', fontWeight: '600' }}`, small indigo dot on the right: `w-1.5 h-1.5 rounded-full` `style={{ backgroundColor: '#4f46e5' }}`
- **Inactive item**: transparent bg, label `text-sm font-medium text-slate-700`

Icon: size 20, color `#4f46e5` when active, `#64748b` when inactive. Label: text-sm.

**Section 3 — Footer** (`border-t border-slate-100`, `className="px-3 py-4"`, `style={{ backgroundColor: '#ffffff' }}`):
Sign Out row: `flex-row items-center gap-3 px-3 py-3 rounded-xl`
- `SignOutIcon` size 20, color `#ef4444`
- "Sign Out" text-sm font-medium text-red-500
- Tapping calls logout() then navigates to /(auth)/login

### Determining the active route

Use `props.state.routes[props.state.index]?.name` from `DrawerContentComponentProps`. Match against route name string ('index', 'fees', 'attendance', etc.).

When a nav item is tapped: call `props.navigation.closeDrawer()` then navigate using `router.push`.

---

## Step 7 — Update ScreenHeader Component

File: `components/shared/screen-header.tsx`

Add an optional `showMenu?: boolean` prop. When true, render the `MenuIcon` button on the far left that calls `navigation.dispatch(DrawerActions.openDrawer())`.

Import `useNavigation` from `@react-navigation/native` and `DrawerActions` from `@react-navigation/drawer`.

The back button uses `BackIcon` (size 24, color `Colors.primary`).
The menu button uses `MenuIcon` (size 24, color `#334155`).

Give both buttons `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`.

`showMenu` and `showBack` are mutually exclusive — `showMenu` shows the hamburger, `showBack` shows the back arrow. Both render on the left side of the header.

Header container must have `style={{ backgroundColor: '#ffffff' }}` explicitly.

---

## Step 8 — Apply showMenu to Main Screens

These screens are primary destinations reachable from the drawer — give their ScreenHeader `showMenu`:
- app/(app)/fees.tsx
- app/(app)/attendance.tsx
- app/(app)/results.tsx
- app/(app)/leaves.tsx
- app/(app)/profile.tsx
- app/(app)/notifications.tsx
- app/(app)/exams.tsx
- app/(app)/notices.tsx
- app/(app)/homework.tsx
- app/(app)/timetable.tsx

The dashboard (app/(app)/index.tsx) has an inline welcome header. Replace it with `<ScreenHeader title="Dashboard" showMenu />` and keep the student name / class text as the first card in the ScrollView.

These screens keep `showBack`:
- app/(app)/change-password.tsx
- app/(app)/edit-profile.tsx
- app/(app)/receipt/[receiptNumber].tsx

select-child.tsx has its own custom header — polish to design system (indigo button, slate colors) but keep structure.

---

## Step 9 — Rewrite UI Component Files

### components/ui/card.tsx
```
className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
style={{ backgroundColor: '#ffffff' }}
```
Keep `className` prop for overrides.

### components/ui/badge.tsx
Pill shape: `rounded-full px-2.5 py-0.5`. Variants: default, primary, success, warning, danger. Text: `text-xs font-medium`. Always include explicit backgroundColor and color in `style={{}}` to match the variant:
- default:  `style={{ backgroundColor: '#f1f5f9', color: '#334155' }}`
- primary:  `style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}`
- success:  `style={{ backgroundColor: '#dcfce7', color: '#166534' }}`
- warning:  `style={{ backgroundColor: '#fef3c7', color: '#92400e' }}`
- danger:   `style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}`

### components/ui/button.tsx
Four variants: primary, outline, ghost, destructive. Keep loading and disabled props. Loading spinner uses correct color per variant. No emoji anywhere.

### components/ui/input.tsx
Apply focused border state using onFocus/onBlur local state. Always set:
- `style={{ backgroundColor: '#ffffff', color: '#0f172a' }}` on the TextInput
- `placeholderTextColor="#94a3b8"` on the TextInput
- Border: slate-300 default, indigo-400 on focus, red-400 on error
Label above (text-sm font-medium text-slate-700), error below (text-xs text-red-500 mt-1).

### components/shared/screen-header.tsx
Apply new styles (white bg with explicit style, slate-200 border-b, bold title, muted subtitle, indigo back icon via BackIcon, hamburger via MenuIcon). See Step 7.

### components/shared/loading.tsx
Spinner: `<ActivityIndicator color="#4f46e5" />`. Background: `style={{ backgroundColor: '#f8fafc' }}`.

### components/shared/error-view.tsx
Use `AlertIcon` (size 48, color "#ef4444") — no emoji. Error text: text-sm text-slate-500 text-center. Retry button: Button outline variant. Background must be white/slate-50 with explicit style.

### components/shared/stat-card.tsx
If this component exists: colored icon background (indigo/green/red/amber with explicit backgroundColor), large bold value, muted label below. White card with border and shadow, explicit `style={{ backgroundColor: '#ffffff' }}`.

---

## Step 10 — Screen-by-Screen Fixes

### app/(app)/index.tsx (Dashboard)

Replace inline welcome View with `<ScreenHeader title="Dashboard" showMenu />`.

Put a welcome block as first card in ScrollView:
- Student name: text-xl font-bold text-slate-900
- Class: text-sm text-slate-500
- Card must have `style={{ backgroundColor: '#ffffff' }}`

Attendance stat boxes: three cells in `flex-row gap-3`:
- indigo: className="bg-indigo-50 flex-1 rounded-xl p-3 items-center" style={{ backgroundColor: '#eef2ff' }}
- green: style={{ backgroundColor: '#f0fdf4' }}
- red: style={{ backgroundColor: '#fef2f2' }}
Value: text-2xl font-bold (explicit color in style). Label: text-xs text-slate-500 mt-1.

Fee summary: label-value rows. Paid value text-green-600, due value red-500 when > 0 else green-600. Explicit text color in style for values.

Upcoming Exams card: rows with border-b border-slate-100. Exam name text-sm font-medium text-slate-800, subject text-xs text-slate-500, date text-xs font-medium style={{ color: '#4f46e5' }} on right, marks text-xs text-slate-400 below date.

Recent Results card: marks/total text-sm font-bold text-slate-900, percentage text-xs text-slate-500 below, grade badge.

Quick Access grid (3×2 or 2×3): each cell `flex-1 rounded-2xl p-4 items-center gap-2 border border-slate-100` with `style={{ backgroundColor: '#ffffff' }}`. Use the appropriate `*Icon` component (size 28, color `#4f46e5`), label text-xs font-semibold text-slate-700. No emoji.

Page background: `className="flex-1 bg-slate-50"` with `style={{ backgroundColor: '#f8fafc' }}`.

### app/(app)/fees.tsx

Summary card: standard label-value rows, "Due" row bold, value red-500 when > 0 else green-600. Add `showMenu` to ScreenHeader.

Installment cards: header row flex-row items-center justify-between, label text-sm font-semibold text-slate-900 flex-1, badge on right. Fee items text-xs text-slate-500 / text-xs text-slate-700. Receipt links: `bg-green-50 border border-green-100 rounded-xl px-3 py-2 flex-row justify-between` with `style={{ backgroundColor: '#f0fdf4' }}`.

### app/(app)/attendance.tsx

Four stat boxes: indigo (rate %), green (present), red (absent), amber (late) — each with explicit backgroundColor style.
Records list: date text-sm font-medium text-slate-800, badge on right, rows border-b border-slate-100 py-3.

### app/(app)/results.tsx

Each result card: exam title text-sm font-semibold text-slate-900, subject text-xs text-slate-500, date text-xs text-slate-400. On right: marks text-lg font-bold text-slate-900, percentage text-xs text-slate-500, grade badge. Card `style={{ backgroundColor: '#ffffff' }}`.

### app/(app)/leaves.tsx

Leave type pills:
- Selected: `style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}` text-white
- Unselected: `style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}` text-slate-700

Date inputs: match Input component style with explicit backgroundColor and color.
Leave list cards: consistent padding, status badge top-right, reason text-xs text-slate-600, review notes italic text-xs text-slate-500.
Cancel button: `py-2 border border-red-200 rounded-xl items-center`, text text-xs font-semibold text-red-500, `style={{ borderColor: '#fecaca', backgroundColor: '#ffffff' }}`.

Apply for Leave header row: `flex-row justify-between items-center`, title text-base font-semibold text-slate-900.

### app/(app)/homework.tsx

Subject badge: primary variant. Due badge: danger for today/overdue, warning for ≤3 days, success otherwise.
Card footer: border-t border-slate-50 pt-2 mt-3, due date text-xs text-slate-400, marks text-xs style={{ color: '#4f46e5' }} font-medium.
Empty state: use `EmptyBoxIcon` (size 48, color "#94a3b8"), no emoji.

### app/(app)/exams.tsx

Filter toggle: `bg-slate-100 rounded-xl p-1` with `style={{ backgroundColor: '#f1f5f9' }}`. Selected tab `bg-white shadow-sm text-slate-900` with `style={{ backgroundColor: '#ffffff' }}`. Unselected text-slate-500.
Exam type badges: rounded-full style.
Divider: `h-px bg-slate-100` with `style={{ backgroundColor: '#f1f5f9' }}`.
Day countdown: red-500 for ≤3 days (explicit style), amber-500 for ≤7 days, slate-400 for further.

### app/(app)/timetable.tsx

Day selector tabs:
- Selected: `style={{ backgroundColor: '#4f46e5' }}` text-white
- Today (unselected): `style={{ backgroundColor: '#eef2ff' }}` style={{ color: '#4f46e5' }}
- Other: `style={{ backgroundColor: '#f8fafc' }}` text-slate-600

Period number circle: `w-10 h-10 rounded-xl items-center justify-center` `style={{ backgroundColor: '#e0e7ff' }}`. Number: text-sm font-bold style={{ color: '#4f46e5' }}.
Subject: text-sm font-semibold text-slate-900. Teacher: text-xs text-slate-500. Time: text-xs font-medium text-slate-700.

### app/(app)/notices.tsx

Priority badges: urgent `style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}`, important `style={{ backgroundColor: '#fef3c7', color: '#92400e' }}`, normal no badge.
Title text-sm font-semibold text-slate-900. Content text-sm text-slate-600 leading-5.
Footer: publisher text-xs text-slate-400, date text-xs text-slate-400.

### app/(app)/notifications.tsx

Unread dot: `w-2.5 h-2.5 rounded-full` `style={{ backgroundColor: '#4f46e5' }}`.
Icon circle: `w-10 h-10 rounded-full items-center justify-center`. Unread: `style={{ backgroundColor: '#eef2ff' }}`, read: `style={{ backgroundColor: '#f1f5f9' }}`. Use `NotificationsIcon` (size 20) inside.
Title: font-semibold text-slate-900 (unread), font-medium text-slate-600 (read).
Message: text-xs text-slate-500 leading-4. Type label: text-xs style={{ color: '#6366f1' }}.
Timestamp: text-xs text-slate-400.
Mark all read: text-xs font-semibold style={{ color: '#4f46e5' }}.

### app/(app)/profile.tsx

Avatar circle: `w-24 h-24 rounded-full items-center justify-center` `style={{ backgroundColor: '#e0e7ff' }}`. Use `ProfileIcon` (size 40, color "#4f46e5") inside — no emoji, no image placeholder unless actual photo.
Name: text-2xl font-bold text-slate-900 mt-3.
Role pill: `rounded-full px-3 py-1 self-center mt-1` `style={{ backgroundColor: '#e0e7ff' }}`, text-xs font-medium style={{ color: '#3730a3' }} capitalize.
Account details card: standard label-value rows, explicit `style={{ backgroundColor: '#ffffff' }}`.
Change Password / Edit Profile buttons: outline variant.
Sign Out button: outline variant with `style={{ borderColor: '#fecaca' }}` and text `style={{ color: '#ef4444' }}`.

### app/(app)/select-child.tsx

Header: title text-2xl font-bold text-slate-900, subtitle text-slate-500.
Sign Out button: `border border-slate-200 rounded-xl px-3 py-1.5` text-sm text-slate-600 font-medium, `style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}`.
Child cards: `w-14 h-14 rounded-2xl items-center justify-center` `style={{ backgroundColor: '#e0e7ff' }}` — use `ProfileIcon` (size 28, color "#4f46e5"). Name text-base font-bold text-slate-900, admission text-xs text-slate-500, relation text-xs text-slate-400. Chevron: use `ChevronRightIcon` (size 20, color "#cbd5e1").

### app/(app)/edit-profile.tsx

Info banner: `rounded-xl px-4 py-3 border` `style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}`, text text-xs style={{ color: '#92400e' }}.
All inputs: Input component with explicit backgroundColor/color styles.
Save button: primary variant. Error text: text-sm text-red-500 text-center.

### app/(app)/change-password.tsx

Same structure as edit-profile. Inputs styled via Input component with explicit styles. Button primary variant.

### app/(app)/receipt/[receiptNumber].tsx

Cards: `bg-white rounded-2xl p-4 border border-slate-200` with `style={{ backgroundColor: '#ffffff' }}`.
Section headers: text-sm font-semibold text-slate-700 mb-3.
Row label: text-sm text-slate-500. Row value: text-sm text-slate-800, bold rows font-bold text-slate-900.
Dividers: `h-px` `style={{ backgroundColor: '#f1f5f9' }}` my-1.
Center header: receipt number text-lg font-bold text-slate-900, date text-sm text-slate-500.

### app/(auth)/login.tsx

Background: `className="flex-1 bg-slate-50"` with `style={{ flex: 1, backgroundColor: '#f8fafc' }}`.
Logo area (centered): `w-20 h-20 rounded-3xl items-center justify-center` `style={{ backgroundColor: '#4f46e5' }}` — use a graduation cap SVG icon (define as `GradCapIcon`) at size 36, color white. No emoji.
App name: text-3xl font-bold text-slate-900 mt-4.
Subtitle: text-base text-slate-500 mt-1.
Form fields: Input component with explicit backgroundColor/color styles.
Sign In button: primary variant, full width, mt-2.
Forgot Password link: text-sm font-medium style={{ color: '#4f46e5' }}, centered, py-2.
Footer note: text-sm text-slate-400 text-center.

### app/(auth)/forgot-password.tsx

Same layout as login. Title relevant to forgot password flow. Submit button: primary variant full width. Back to login link: text-sm style={{ color: '#4f46e5' }} font-medium centered.

---

## Step 11 — What NOT to Change

- Anything inside `lib/` (api.ts, auth-store.ts, types.ts, secure-storage.ts)
- Anything inside `hooks/`
- metro.config.js, babel.config.js, tailwind.config.js
- Navigation logic (router.push / router.replace calls)
- Data transformation logic inside screens
- API call arguments or response handling
- Component prop interfaces beyond adding optional `className?: string` or `showMenu?: boolean`

---

## Step 12 — Verification

After all changes:
1. Run `npx tsc --noEmit` in `/home/alpesh/alpesh/oac.mobile` and fix any new TypeScript errors
2. Confirm every screen file imports are valid (no missing components)
3. Confirm the drawer layout file has no references to Tabs or tabBarStyle
4. Confirm all screens that were Tabs now work as Drawer screens
5. Confirm zero emoji characters appear in any `.tsx` file in `app/` or `components/`
6. Confirm every `TextInput` has `style={{ color: '#0f172a' }}` and `placeholderTextColor="#94a3b8"`
7. Confirm every card/screen container has an explicit `backgroundColor` in its `style={{}}` prop
