# Mobile App UI Redesign — Full Prompt for AI Agent

## Your Task

Redesign the entire UI of this React Native / Expo mobile app (`/home/alpesh/alpesh/oac.mobile`) to match the visual design language of the companion web app (`/home/alpesh/alpesh/oac.local`). This is a **visual-only** task — do not change any API calls, hooks, data fetching, business logic, navigation logic, or TypeScript interfaces unless a prop needs to be added to support a UI change.

Read every file before editing it. After all changes, run `npx tsc --noEmit` inside `/home/alpesh/alpesh/oac.mobile` and fix any TypeScript errors introduced by your changes.

---

## Tech Stack

- Expo (expo-router ~6.0.23)
- React Native
- NativeWind (Tailwind CSS class names on RN components)
- react-native-gesture-handler and react-native-reanimated are already installed
- `@react-navigation/drawer` is NOT installed — you must install it first

---

## Step 1 — Install Required Package

Run this before making any code changes:

```
npx expo install @react-navigation/drawer
```

---

## Step 2 — Design System to Apply

### Color palette (use these Tailwind class names throughout, never hardcode hex)

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

Only use `Colors` from `constants/colors.ts` inside `style={{}}` props where Tailwind cannot reach (e.g. `ActivityIndicator color`, drawer `drawerActiveTintColor`). Update `constants/colors.ts` values to match: primary = '#4f46e5', primaryLight = '#eef2ff', border = '#e2e8f0', borderLight = '#f1f5f9', text = '#0f172a', textSecondary = '#475569', textMuted = '#64748b', textPlaceholder = '#94a3b8', success = '#16a34a', successLight = '#dcfce7', warning = '#d97706', warningLight = '#fef3c7', danger = '#ef4444', dangerLight = '#fee2e2'.

### Typography rules

- Page / screen title:  text-xl font-bold text-slate-900
- Section heading:      text-base font-semibold text-slate-900
- Card label:           text-sm font-medium text-slate-700
- Body text:            text-sm text-slate-600
- Caption / meta:       text-xs text-slate-500
- Stat value large:     text-2xl font-bold (color depends on context)
- Link / action text:   text-sm font-medium text-indigo-600

### Card style

bg-white rounded-2xl p-4 border border-slate-200 shadow-sm

### Badge style (pill shape, soft colored backgrounds)

All badges: rounded-full px-2.5 py-0.5 text-xs font-medium
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

Border: border-slate-300 default, border-red-400 when error prop present, border-indigo-400 when focused (track focus with onFocus/onBlur state).
Background: bg-white. Padding: px-4 py-3.5. Text: text-slate-900 text-base.
Label: text-sm font-medium text-slate-700 shown above input with mb-1.5 gap.
Error message: text-xs text-red-500 mt-1 shown below input.
Placeholder color: #94a3b8.

### Screen header style

bg-white border-b border-slate-200 px-5 pt-4 pb-3
Title: text-xl font-bold text-slate-900
Subtitle: text-sm text-slate-500 mt-0.5
Back arrow: ← character, text-2xl text-indigo-600
Hamburger icon: three lines (custom View-based bars), text-slate-700

### List row style (inside cards)

flex-row items-center justify-between py-3 border-b border-slate-100
Label: text-sm text-slate-500
Value: text-sm font-medium text-slate-900

### Stat box style (colored background cells)

rounded-xl p-3 items-center
- indigo stat: bg-indigo-50, value text-2xl font-bold text-indigo-600
- green stat:  bg-green-50, value text-2xl font-bold text-green-600
- red stat:    bg-red-50, value text-2xl font-bold text-red-500
- amber stat:  bg-amber-50, value text-2xl font-bold text-amber-500
Label below value: text-xs text-slate-500 mt-1

### Empty state style

py-16 items-center gap-3
Emoji: text-4xl
Message: text-base text-slate-500

### Section divider

h-px bg-slate-100 (use as a View with no children)

---

## Step 3 — Replace Bottom Tab Bar with Sidebar Drawer

The current `app/(app)/_layout.tsx` uses `<Tabs>`. Replace it entirely with a `<Drawer>` from `expo-router/drawer`.

### Drawer layout rules

- Drawer slides in from the LEFT
- Width: 280
- Swipe-to-open from left edge (swipeEdgeWidth: 50) works on all main screens
- Wrap everything in `<GestureHandlerRootView style={{ flex: 1 }}>`
- ALL screens currently listed as Tabs.Screen become Drawer.Screen
- Screens that are not navigation destinations (change-password, edit-profile, select-child, receipt/[receiptNumber]) get `options={{ drawerItemStyle: { display: 'none' } }}`
- Do NOT render the default drawer items — use a fully custom drawer content component

### Custom drawer content design

The drawer has three sections stacked vertically:

Section 1 — Header (indigo-600 background, white text):
- Tall header area with bg-indigo-600
- 56×56 rounded-2xl white/20 icon box containing 🎓 emoji (text-3xl)
- App name "Student Portal" in text-lg font-bold text-white
- User's full name in text-indigo-200 text-sm
- Role badge: self-start bg-white/20 rounded-full px-2.5 py-0.5 text-white text-xs font-medium capitalize

Section 2 — Navigation items (scrollable, white background):
px-3 py-3 ScrollView with these items in order:
Home (🏠), Fees (💳), Attendance (📅), Results (📊), Leaves (📝), Homework (📚), Timetable (🗓️), Exam Schedule (📋), Notices (📢), Notifications (🔔), Profile (👤)

Each nav item row: flex-row items-center gap-3 px-3 py-3 rounded-xl mb-0.5
- Active item (current route): bg-indigo-50, label text-indigo-700 font-semibold, small indigo dot on the right (w-1.5 h-1.5 rounded-full bg-indigo-600 ml-auto)
- Inactive item: bg-transparent, label text-slate-700 font-medium
Emoji: text-xl w-7 text-center. Label: text-sm.

Section 3 — Footer (border-t border-slate-100):
px-3 py-4
Sign Out row: 🚪 emoji + "Sign Out" text-sm font-medium text-red-500
Tapping calls logout() then navigates to /(auth)/login

### Determining the active route

Use `props.state.routes[props.state.index]?.name` from `DrawerContentComponentProps` to know which route is active. Match it against the route name string (e.g. 'index', 'fees', 'attendance').

When a nav item is tapped: call `props.navigation.closeDrawer()` then navigate using `router.push`.

---

## Step 4 — Update ScreenHeader Component

File: `components/shared/screen-header.tsx`

Add an optional `showMenu?: boolean` prop. When true, render a hamburger icon button on the far left that calls `navigation.dispatch(DrawerActions.openDrawer())`.

Import `useNavigation` and `DrawerActions` from `@react-navigation/native`.

The hamburger icon is three horizontal bars made from View elements: two w-5 and one w-4, all h-0.5 bg-slate-700 rounded-full, with gap-1.5 between them.

Give it hitSlop of 8px on all sides for easier tapping.

showMenu and showBack are mutually exclusive — showMenu shows the hamburger, showBack shows the back arrow. Both render on the left side of the header.

---

## Step 5 — Apply showMenu to Main Screens

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

The dashboard (app/(app)/index.tsx) has an inline welcome header (a plain View), not a ScreenHeader. Replace that inline header with `<ScreenHeader title="Dashboard" showMenu />` and keep the student name / class text as a separate small card or info block below it inside the ScrollView.

These screens keep `showBack` (accessed via back navigation, not drawer):
- app/(app)/change-password.tsx
- app/(app)/edit-profile.tsx
- app/(app)/receipt/[receiptNumber].tsx

select-child.tsx has its own custom header — leave it as-is structurally but polish it to match the design system (indigo button, correct font weights, slate colors).

---

## Step 6 — Rewrite UI Component Files

### components/ui/card.tsx
Apply: bg-white rounded-2xl p-4 border border-slate-200 shadow-sm
Keep the className prop for overrides.

### components/ui/badge.tsx
Pill shape: rounded-full px-2.5 py-0.5. Variants: default, primary, success, warning, danger (colors as listed in design system above). Text: text-xs font-medium.

### components/ui/button.tsx
Four variants: primary, outline, ghost, destructive (designs above). Keep loading and disabled props. Loading spinner uses correct color per variant.

### components/ui/input.tsx
Apply focused border state using onFocus/onBlur. Border transitions: slate-300 → indigo-400 on focus, red-400 when error prop is set. Label above, error message below.

### components/shared/screen-header.tsx
Apply new styles (white bg, slate-200 border-b, bold title, muted subtitle, indigo back arrow, hamburger menu button). Add showMenu prop as described above.

### components/shared/loading.tsx and error-view.tsx
Polish to use correct colors: spinner in indigo-600, error text in red-500, retry button using Button component with outline variant.

### components/shared/stat-card.tsx
If this component exists and is used on the dashboard, it should show: colored icon background circle (indigo/green/red/amber), large bold value, muted label below. White card with border and shadow.

---

## Step 7 — Screen-by-Screen Fixes

### app/(app)/index.tsx (Dashboard)

Remove the inline px-5 pt-4 pb-2 welcome View. Replace with ScreenHeader (showMenu). Put a small welcome block as the first card in the ScrollView: student name text-xl font-bold text-slate-900, class text-sm text-slate-500.

Attendance stat boxes: three cells in a flex-row gap-3 — indigo-50/indigo-600 for overall %, green-50/green-600 for present, red-50/red-500 for absent. Each cell: flex-1 rounded-xl p-3 items-center, value text-2xl font-bold, label text-xs text-slate-500 mt-1.

Fee summary: label-value rows. Paid row value in green-600, due row value in red-500 when > 0 else green-600.

Upcoming Exams card: rows with border-b border-slate-100, exam name text-sm font-medium text-slate-800, subject text-xs text-slate-500, date text-xs font-medium text-indigo-600 on right, marks text-xs text-slate-400 below date.

Recent Results card: same row structure, marks/total text-sm font-bold text-slate-900 on right, percentage text-xs text-slate-500 below, grade badge below that.

Quick Access grid (3×2): each cell flex-1 bg-white rounded-2xl p-4 items-center gap-2 border border-slate-100. Emoji text-3xl, label text-xs font-semibold text-slate-700.

### app/(app)/fees.tsx

Summary card: standard label-value rows, "Due" row bold, value red-500 when > 0 else green-600. Add showMenu to ScreenHeader.

Installment cards: header row flex-row items-center justify-between, label text-sm font-semibold text-slate-900 flex-1, badge on right. Fee items text-xs text-slate-500 / text-xs text-slate-700. Receipt links: bg-green-50 border border-green-100 rounded-xl px-3 py-2 flex-row justify-between.

### app/(app)/attendance.tsx

Four stat boxes: indigo (rate %), green (present), red (absent), amber (late). Records list: date text-sm font-medium text-slate-800, badge on right, rows border-b border-slate-100 py-3.

### app/(app)/results.tsx

Each result card: exam title text-sm font-semibold text-slate-900, subject text-xs text-slate-500, date text-xs text-slate-400. On right: marks text-lg font-bold text-slate-900, percentage text-xs text-slate-500, grade badge.

### app/(app)/leaves.tsx

Apply button header (Apply for Leave): flex-row justify-between, title text-base font-semibold text-slate-900, toggle icon text-lg text-indigo-500.

Leave type pills (selected): bg-indigo-600 border-indigo-600 text-white; (unselected): bg-white border-slate-200 text-slate-700. Date inputs must match the Input component style. Leave list cards: consistent padding, status badge top-right, reason text-xs text-slate-600, review notes italic text-xs text-slate-500. Cancel button: py-2 border border-red-200 rounded-xl items-center, text text-xs font-semibold text-red-500.

### app/(app)/results.tsx

Already described above.

### app/(app)/homework.tsx

Subject badge primary variant. Due badge: danger for today/overdue, warning for ≤3 days, success otherwise. Card footer: border-t border-slate-50 pt-2 mt-3, due date text-xs text-slate-400, marks text-xs text-indigo-500 font-medium.

### app/(app)/exams.tsx

Filter toggle: bg-slate-100 rounded-xl p-1, selected tab bg-white shadow-sm text-slate-900, unselected text-slate-500. Exam type badges: keep existing colored variants but use rounded-full style. Divider: h-px bg-slate-100. Day countdown text: red-500 for ≤3 days, amber-500 for ≤7 days, slate-400 for further.

### app/(app)/timetable.tsx

Day selector tabs: selected bg-indigo-600 text-white, today (unselected) bg-indigo-50 text-indigo-600, other bg-slate-50 text-slate-600. Period cards: period number circle bg-indigo-100 rounded-xl w-10 h-10, number text-sm font-bold text-indigo-600. Subject text-sm font-semibold text-slate-900. Teacher text-xs text-slate-500. Time text-xs font-medium text-slate-700 / text-xs text-slate-400.

### app/(app)/notices.tsx

Priority badges: urgent bg-red-100 text-red-700, important bg-amber-100 text-amber-700, normal no badge. Title text-sm font-semibold text-slate-900. Content text-sm text-slate-600 leading-5. Footer: publisher text-xs text-slate-400, date text-xs text-slate-400. Add showMenu to ScreenHeader.

### app/(app)/notifications.tsx

Unread dot: w-2.5 h-2.5 rounded-full bg-indigo-600. Icon circle: w-10 h-10 rounded-full bg-indigo-50 (unread) or bg-slate-50 (read). Title: font-semibold text-slate-900 (unread) or font-medium text-slate-600 (read). Message: text-xs text-slate-500 leading-4. Type label: text-xs text-indigo-500. Timestamp: text-xs text-slate-400. Unread count header: text-xs text-slate-500. Mark all read: text-xs font-semibold text-indigo-600.

### app/(app)/profile.tsx

Avatar circle: w-24 h-24 bg-indigo-100 rounded-full items-center justify-center. Name: text-2xl font-bold text-slate-900 mt-3. Role pill: bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full capitalize self-center mt-1. Account details card: standard label-value rows. Switch Child / Change Password / Edit Profile buttons: outline variant. Sign Out button: outline variant with className override to show border-red-200 and text red-500.

### app/(app)/select-child.tsx

Header: title text-2xl font-bold text-slate-900, subtitle text-slate-500. Sign Out button: border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-600 font-medium. Child cards: w-14 h-14 bg-indigo-100 rounded-2xl icon box, name text-base font-bold text-slate-900, admission text-xs text-slate-500, relation text-xs text-slate-400, chevron text-slate-300 text-xl.

### app/(app)/edit-profile.tsx

Info banner: bg-amber-50 border border-amber-200 rounded-xl px-4 py-3, text text-xs text-amber-700. All inputs: use Input component (already done). Save button: primary variant. Error text: text-sm text-red-500 text-center.

### app/(app)/change-password.tsx

Same structure as edit-profile. Inputs styled via Input component. Button primary variant.

### app/(app)/receipt/[receiptNumber].tsx

Cards: use bg-white rounded-2xl p-4 border border-slate-200 (update any border-slate-100 to border-slate-200). Section headers: text-sm font-semibold text-slate-700 mb-3. Row label: text-sm text-slate-500. Row value: text-sm text-slate-800, bold rows use font-bold text-slate-900. Dividers: h-px bg-slate-100 my-1. Center header: receipt number text-lg font-bold text-slate-900, date text-sm text-slate-500.

### app/(auth)/login.tsx

Background: bg-slate-50 full screen.
Logo area (centered): w-20 h-20 bg-indigo-600 rounded-3xl items-center justify-center shadow-lg, 🎓 text-4xl inside.
App name: text-3xl font-bold text-slate-900 mt-4.
Subtitle: text-base text-slate-500 mt-1.
Form fields: use Input component (already used, ensure styles match design system above).
Sign In button: primary variant, full width, mt-2.
Forgot Password link: text-sm font-medium text-indigo-600, centered, py-2.
Footer note: text-sm text-slate-400 text-center.

### app/(auth)/forgot-password.tsx

Same layout as login. Title relevant to forgot password flow. Submit button: primary variant full width. Back to login link: text-sm text-indigo-600 font-medium centered.

---

## Step 8 — What NOT to Change

- Anything inside `lib/` (api.ts, auth-store.ts, types.ts, secure-storage.ts)
- Anything inside `hooks/`
- app.json, metro.config.js, babel.config.js, tailwind.config.js
- Navigation logic (router.push / router.replace calls)
- Data transformation logic inside screens
- API call arguments or response handling
- Component prop interfaces beyond adding optional `className?: string` or `showMenu?: boolean`

---

## Step 9 — Verification

After all changes:
1. Run `npx tsc --noEmit` in `/home/alpesh/alpesh/oac.mobile` and fix any new TypeScript errors
2. Confirm every screen file imports are valid (no missing components)
3. Confirm the drawer layout file has no references to Tabs or tabBarStyle
4. Confirm all screens that were Tabs now work as Drawer screens
