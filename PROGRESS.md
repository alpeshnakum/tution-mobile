# OAC Mobile — Full Project Progress

> **Last updated:** 2026-05-28 (session 2)
> **App name:** OAC Student Portal
> **Platform:** React Native (Expo ~54.0.0, SDK 54), TypeScript
> **Scope:** Student + Parent portal (student primary, parent can select child)

---

## Quick Status

| Area | Status |
|------|--------|
| Project setup & infra | ✅ Done |
| Auth (login/logout/session) | ✅ Done |
| Navigation (tab-based) | ✅ Done |
| Dashboard | ✅ Done |
| Attendance | ✅ Done |
| Fees + Receipt | ✅ Done |
| Results | ✅ Done |
| Homework | ✅ Done |
| Timetable | ✅ Done |
| Leave Requests | ✅ Done |
| Notifications | ✅ Done |
| Notices / Announcements | ✅ Done |
| Exam Schedule | ✅ Done |
| Profile (view) | ✅ Done |
| Edit Profile | ✅ Done |
| Change Password | ✅ Done |
| Parent child-select | ✅ Done (basic) |
| Forgot Password | ✅ Screen exists |
| Reset Password (OTP flow) | ✅ Done (built into forgot-password.tsx, step 2) |
| Homework Detail screen | ✅ Done |
| Notification Detail screen | ✅ Done |
| Leave Apply form screen | ✅ Done (dedicated screen) |
| Dark mode | ✅ Done (CSS vars + darkMode:media + dynamic tab bar) |
| NoInternetBanner | ✅ Done |
| Skeleton loaders | ✅ Done (homework, notifications, leaves, results) |
| Push notifications | ❌ Not started |
| Online payments (Razorpay) | ❌ Not started |
| Biometric unlock | ✅ Done (Face ID/fingerprint on login, iOS Face ID permission) |
| EAS build + app store | ❌ Not started |
| Tests (unit + E2E) | ❌ Not started |

---

## Tech Stack (Actual — as built)

> **Note:** The original plan spec'd Expo ~51, Drawer nav, TanStack Query, MMKV, react-hook-form, zod, and terracotta theme. The actual build diverged — see deviations section below.

| Layer | Package | Version | Notes |
|-------|---------|---------|-------|
| Framework | expo | ~54.0.0 | Managed workflow |
| Language | typescript | ~5.x | Strict mode |
| Routing | expo-router | ~6.0.23 | File-based routing |
| Navigation | Expo Tabs | built-in | Bottom tab bar (not drawer) |
| Styling | nativewind | ^4.0.36 | Tailwind CSS for RN |
| Styling | tailwindcss | ^3.4.0 | Config only |
| State | zustand | ^5.0.0 | Auth store (no separate student store) |
| Data fetching | custom hooks | — | useState + useEffect + axios (no TanStack Query) |
| HTTP | axios | ^1.7.0 | With JWT interceptor |
| Storage | expo-secure-store | ~15.0.8 | Token, user, studentId, classId, sectionId, sessionId |
| Storage | @react-native-async-storage/async-storage | 2.2.0 | Installed, not actively used |
| Date | date-fns | ^3.6.0 | Formatting only |
| Gestures | react-native-gesture-handler | ~2.28.0 | Required by Expo Router |
| Animation | react-native-reanimated | ~4.1.1 | Required by Expo Router |
| Safe area | react-native-safe-area-context | ~5.6.0 | Notch/status bar |
| Screens | react-native-screens | ~4.16.0 | Native screen optimisation |
| Toast | react-native-toast-message | ^2.2.0 | Installed, usage unclear |

**NOT installed (planned but skipped):**
- `@tanstack/react-query` — replaced with custom hooks
- `react-native-mmkv` — replaced with expo-secure-store
- `react-hook-form` + `zod` — forms done manually
- `expo-local-authentication` — biometric not implemented
- `@react-native-community/netinfo` — offline banner not implemented
- `@react-navigation/drawer` — using Expo Tabs instead

---

## Actual vs Plan Deviations

| Aspect | Plan | Actual |
|--------|------|--------|
| Navigation | `@react-navigation/drawer` — hamburger sidebar | Expo Router Tabs — bottom tab bar |
| Theme | Terracotta `#CC785C` / cream `#FAF9F5` | Indigo `#6366f1` / slate `#f8fafc` |
| Data layer | TanStack Query v5 | Custom `useState + useEffect + axios` hooks |
| Fast storage | react-native-mmkv | expo-secure-store for everything |
| Forms | react-hook-form + zod | Inline `useState` or none |
| Expo SDK | ~51.x | ~54.0.0 (newer) |
| Folder structure | `src/screens/`, `src/components/` | `app/`, `components/`, `hooks/`, `lib/` |
| Auth screens | Login + ForgotPwd + ResetPwd (3) | Login + ForgotPwd (2 — Reset missing) |
| Drawer sidebar | Custom avatar + nav items + logout footer | N/A — tab bar used |

---

## Architecture Overview

```
oac.mobile/
├── app/
│   ├── _layout.tsx              Root layout — auth guard, loads session from SecureStore
│   ├── (auth)/
│   │   ├── _layout.tsx          Auth stack layout
│   │   ├── login.tsx            Login screen
│   │   └── forgot-password.tsx  Forgot password screen
│   └── (app)/
│       ├── _layout.tsx          Tab navigator (5 visible tabs + hidden screens)
│       ├── index.tsx            Dashboard (Home tab)
│       ├── fees.tsx             Fees summary
│       ├── attendance.tsx       Attendance (Attendance tab)
│       ├── results.tsx          Exam results (Results tab)
│       ├── leaves.tsx           Leave requests (Leaves tab)
│       ├── profile.tsx          Profile + logout (Profile tab)
│       ├── homework.tsx         Homework list (hidden from tab bar)
│       ├── timetable.tsx        Weekly timetable (hidden)
│       ├── notifications.tsx    Notification inbox (hidden)
│       ├── notices.tsx          Announcements (hidden)
│       ├── exams.tsx            Exam schedule (hidden)
│       ├── edit-profile.tsx     Edit phone/email/address (hidden)
│       ├── change-password.tsx  Change password (hidden)
│       ├── select-child.tsx     Parent: child selector (hidden)
│       └── receipt/
│           └── [receiptNumber].tsx  Fee receipt detail (dynamic route)
├── components/
│   ├── shared/
│   │   ├── error-view.tsx       Full-screen error + retry
│   │   ├── loading.tsx          Spinner (full-screen or inline)
│   │   ├── screen-header.tsx    Reusable screen title header
│   │   └── stat-card.tsx        Dashboard stat tile
│   └── ui/
│       ├── badge.tsx            Status badge (success/danger/warning/default)
│       ├── button.tsx           Primary/secondary/destructive button
│       ├── card.tsx             Surface card container
│       └── input.tsx            Text input field
├── hooks/
│   ├── use-announcements.ts     GET /api/portal/student/notices
│   ├── use-attendance.ts        GET /api/portal/student/attendance
│   ├── use-children.ts          GET /api/portal/parent/children
│   ├── use-dashboard.ts         GET /api/portal/student/dashboard
│   ├── use-exams.ts             GET /api/portal/student/exams
│   ├── use-fees.ts              GET /api/portal/student/fees
│   ├── use-homework.ts          GET /api/homework/class/:classId
│   ├── use-leaves.ts            GET/POST/DELETE /api/portal/student/leaves
│   ├── use-notifications.ts     GET /api/notifications + mark-read PATCH
│   ├── use-profile-update.ts    PUT /api/portal/student/profile
│   ├── use-receipt.ts           GET /api/portal/student/fees/receipt/:receiptNumber
│   ├── use-results.ts           GET /api/portal/student/results
│   └── use-timetable.ts         GET /api/timetable
├── lib/
│   ├── api.ts                   Axios instance — baseURL from EXPO_PUBLIC_API_URL, JWT interceptor, 401 auto-clear
│   ├── auth-store.ts            Zustand store — login/logout/loadFromStorage/setStudentMeta
│   ├── secure-storage.ts        expo-secure-store wrapper — token, user, studentId, classId, sectionId, sessionId
│   └── types.ts                 All TypeScript interfaces
├── constants/
│   └── colors.ts                Design tokens (indigo/slate — NOT terracotta as planned)
└── mobile-plan/                 Original 12-phase planning docs (reference only)
```

---

## Navigation Structure (Actual)

```
RootLayout (_layout.tsx)
├── Stack: (auth)  ← shown when isAuthenticated === false
│   ├── login.tsx
│   └── forgot-password.tsx
└── Stack: (app)   ← shown when isAuthenticated === true
    └── Tabs (_layout.tsx)  ← bottom tab bar
        ├── Tab: Home       → index.tsx (Dashboard)
        ├── Tab: Fees       → fees.tsx
        ├── Tab: Attendance → attendance.tsx
        ├── Tab: Results    → results.tsx
        ├── Tab: Leaves     → leaves.tsx
        ├── Tab: Profile    → profile.tsx
        └── Hidden screens (href: null — navigated via router.push):
            ├── homework.tsx
            ├── timetable.tsx
            ├── notifications.tsx
            ├── notices.tsx
            ├── exams.tsx
            ├── edit-profile.tsx
            ├── change-password.tsx
            ├── select-child.tsx
            └── receipt/[receiptNumber].tsx
```

---

## Auth Flow

1. App starts → `RootLayout` calls `loadFromStorage()`
2. `loadFromStorage` reads token + user + studentId + meta from `expo-secure-store`
3. If token found → `isAuthenticated = true` → redirect to `(app)`
4. If not found → `isAuthenticated = false` → redirect to `(auth)/login`
5. Login: POST `/api/auth/login` → save token + user + studentId to SecureStore → set Zustand state
6. Logout: POST `/api/auth/logout` (fire-and-forget) → `clearAll()` from SecureStore → reset Zustand
7. 401 response: auto-clears SecureStore (user must re-login)
8. Parent role: after login, if `user.role === 'parent'` and no `studentId` → redirected to `select-child.tsx`

**Missing from auth flow:**
- Forgot password: screen exists (`forgot-password.tsx`) but OTP reset flow has no `reset-password.tsx` screen
- No token refresh / silent re-auth
- No biometric unlock

---

## State Management

### Zustand `useAuthStore` (`lib/auth-store.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `user` | `User \| null` | Logged-in user object (id, username, role, branchId, etc.) |
| `accessToken` | `string \| null` | JWT access token |
| `studentId` | `string \| null` | Active student's ID (from user or selected child) |
| `studentClassId` | `string \| null` | Set from dashboard API response |
| `studentSectionId` | `string \| null` | Set from dashboard API response |
| `studentSessionId` | `string \| null` | Set from dashboard API response |
| `isAuthenticated` | `boolean` | True when token + user loaded |
| `isLoading` | `boolean` | True during initial session restore |
| `error` | `string \| null` | Last login error message |

### Custom Data Hooks Pattern
All data hooks follow this pattern (no TanStack Query):
```ts
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
// fetch on mount, expose refetch
return { data, loading, error, refetch };
```

---

## API Contracts

### Base URL
Set in `.env`: `EXPO_PUBLIC_API_URL=https://your-erp-domain.com`
All requests inject `Authorization: Bearer <accessToken>` via Axios interceptor.
All responses: `{ success: boolean, data: T, meta?: {...}, error: string | null }`

### Endpoints used by mobile

| Endpoint | Method | Hook | Screen | Notes |
|----------|--------|------|--------|-------|
| `/api/auth/login` | POST | auth-store | login.tsx | Returns `{ user, accessToken }` |
| `/api/auth/logout` | POST | auth-store | profile.tsx | Fire-and-forget |
| `/api/auth/forgot-password` | POST | — | forgot-password.tsx | ⚠️ Backend may need build |
| `/api/auth/reset-password` | POST | — | ❌ Screen missing | ⚠️ Backend may need build |
| `/api/auth/change-password` | PUT | — | change-password.tsx | Built in Phase 11 |
| `/api/portal/student/dashboard` | GET | use-dashboard | index.tsx | Returns student, session, stats, upcomingExams, recentResults |
| `/api/portal/student/attendance` | GET | use-attendance | attendance.tsx | Query: `studentId`, `month`, `year` |
| `/api/portal/student/fees` | GET | use-fees | fees.tsx | Returns totals, installments, paymentHistory |
| `/api/portal/student/fees/receipt/:receiptNumber` | GET | use-receipt | receipt/[receiptNumber].tsx | Full receipt breakdown |
| `/api/portal/student/results` | GET | use-results | results.tsx | Returns exam results array |
| `/api/homework/class/:classId` | GET | use-homework | homework.tsx | Query: `status`, `subjectId` |
| `/api/timetable` | GET | use-timetable | timetable.tsx | Query: classId, sectionId, sessionId, branchId |
| `/api/portal/student/leaves` | GET | use-leaves | leaves.tsx | Built in Phase 9 |
| `/api/portal/student/leaves` | POST | use-leaves | leaves.tsx | Built in Phase 9 |
| `/api/portal/student/leaves/:id` | DELETE | use-leaves | leaves.tsx | Built in Phase 9 — cancel pending leave |
| `/api/notifications` | GET | use-notifications | notifications.tsx | Query: recipientId, channel=in_app, page, limit |
| `/api/notifications/:id/read` | PATCH | use-notifications | notifications.tsx | Mark single as read |
| `/api/portal/student/notices` | GET | use-announcements | notices.tsx | Announcements/notices |
| `/api/portal/student/exams` | GET | use-exams | exams.tsx | Exam schedule list |
| `/api/portal/student/profile` | PUT | use-profile-update | edit-profile.tsx | Built in Phase 11 — phone/email/address only |
| `/api/portal/parent/children` | GET | use-children | select-child.tsx | Parent only |

### Backend APIs that need building (not yet in ERP)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/auth/forgot-password` | POST | ⚠️ Needs verification | OTP email, 10-min expiry, always return 200 |
| `/api/auth/reset-password` | POST | ⚠️ Needs verification | Verify OTP + update password |

---

## Screen-by-Screen Status

### Auth Screens

| Screen | File | Status | Notes |
|--------|------|--------|-------|
| Login | `(auth)/login.tsx` | ✅ Done | identifier + password, saves to SecureStore |
| Forgot Password | `(auth)/forgot-password.tsx` | ✅ Screen done | Backend OTP endpoint may need verification |
| Reset Password | built into `(auth)/forgot-password.tsx` step 2 | ✅ Done | OTP entry + new password in same screen as forgot-password |

### Main Tab Screens

| Screen | File | Status | Notes |
|--------|------|--------|-------|
| Dashboard | `(app)/index.tsx` | ✅ Done | Stats, upcoming exams, recent results, quick links |
| Fees | `(app)/fees.tsx` | ✅ Done | Installment list, totals, payment history rows → tap opens receipt |
| Attendance | `(app)/attendance.tsx` | ✅ Done | Monthly calendar-style list, summary bar |
| Results | `(app)/results.tsx` | ✅ Done | Exam result cards with grade/marks/pass-fail |
| Leave Requests | `(app)/leaves.tsx` | ✅ Done | List with status filter; leave apply inline (not separate screen) |
| Profile | `(app)/profile.tsx` | ✅ Done | View user details, buttons to edit profile / change password / logout |

### Hidden Screens (navigated via `router.push`)

| Screen | File | Status | Notes |
|--------|------|--------|-------|
| Homework | `(app)/homework.tsx` | ✅ Done | List with status/subject filter |
| Timetable | `(app)/timetable.tsx` | ✅ Done | Day-tab layout, period cards |
| Notifications | `(app)/notifications.tsx` | ✅ Done | Inbox, mark-as-read on tap, mark-all-read |
| Notices | `(app)/notices.tsx` | ✅ Done | Announcements with priority badge |
| Exam Schedule | `(app)/exams.tsx` | ✅ Done | Upcoming / All filter |
| Edit Profile | `(app)/edit-profile.tsx` | ✅ Done | Phone / email / address only (studentId from JWT) |
| Change Password | `(app)/change-password.tsx` | ✅ Done | Current + new + confirm password |
| Select Child | `(app)/select-child.tsx` | ✅ Done | Parent role: pick which child's data to view |
| Fee Receipt | `(app)/receipt/[receiptNumber].tsx` | ✅ Done | Full breakdown — feeHeads, concession, payment method |
| Homework Detail | `(app)/homework/[id].tsx` | ✅ Done | Subject/status badges, due date, full description, graded info |
| Notification Detail | `(app)/notifications/[id].tsx` | ✅ Done | Full body, type badge, read status, timestamps |
| Leave Apply | `(app)/leaves/apply.tsx` | ✅ Done | Dedicated form, validation, direct API call; leaves.tsx refetches on focus |

---

## Components Inventory

### `components/shared/`

| Component | File | Purpose |
|-----------|------|---------|
| ErrorView | `error-view.tsx` | Full-screen error message + retry button |
| Loading | `loading.tsx` | Spinner — `fullScreen` prop for full-page, or inline |
| ScreenHeader | `screen-header.tsx` | Reusable screen title bar with optional back button |
| StatCard | `stat-card.tsx` | Dashboard stat tile (label + value + optional icon/colour) |

### `components/ui/`

| Component | File | Variants / Props |
|-----------|------|-----------------|
| Badge | `badge.tsx` | `variant`: success / danger / warning / default |
| Button | `button.tsx` | `variant`: primary / secondary / destructive; `loading` prop |
| Card | `card.tsx` | Surface container with border and shadow |
| Input | `input.tsx` | Text input with label, error state |

**Missing components (planned, not built):**
- `NoInternetBanner` — banner at top when offline (`netinfo` not installed)
- Skeleton loaders — loading shimmer (currently spinner only)
- `HomeworkCard` — planned as standalone component, currently inline
- `NotificationRow` — planned as standalone, currently inline
- `LeaveCard` — planned as standalone, currently inline

---

## TypeScript Types (`lib/types.ts`)

| Interface | Used by |
|-----------|---------|
| `User` | auth-store, all screens |
| `AuthState` | auth-store |
| `DashboardData` | use-dashboard, index.tsx |
| `FeeInstallment` | use-fees, fees.tsx |
| `FeesData` | use-fees, fees.tsx |
| `AttendanceRecord` | use-attendance, attendance.tsx |
| `AttendanceData` | use-attendance, attendance.tsx |
| `ExamResult` | use-results, results.tsx |
| `Child` | use-children |
| `LeaveRequest` | use-leaves, leaves.tsx |
| `HomeworkItem` | use-homework, homework.tsx |
| `TimetablePeriod` | use-timetable, timetable.tsx |
| `TimetableDay` | use-timetable, timetable.tsx |
| `ExamSubject` | use-exams, exams.tsx |
| `ExamScheduleItem` | use-exams, exams.tsx |
| `ExamsData` | use-exams, exams.tsx |
| `FeeBreakdownItem` | use-receipt, receipt screen |
| `ReceiptData` | use-receipt, receipt screen |
| `NotificationItem` | use-notifications, notifications.tsx |
| `NotificationsData` | use-notifications |
| `Announcement` | use-announcements, notices.tsx |
| `ChildInfo` | use-children, select-child.tsx |
| `ApiResponse<T>` | all hooks (generic wrapper) |

---

## Design System (Actual)

> **Deviation from plan:** Plan specified terracotta theme matching the web ERP. Actual build uses indigo/slate.

```ts
// constants/colors.ts — actual values
export const Colors = {
  primary:          '#6366f1',   // indigo (plan was #CC785C terracotta)
  primaryLight:     '#e0e7ff',
  primaryForeground:'#ffffff',
  background:       '#f8fafc',   // slate-50 (plan was #FAF9F5 cream)
  card:             '#ffffff',
  border:           '#e2e8f0',
  text:             '#0f172a',
  textMuted:        '#64748b',
  success:          '#22c55e',
  successLight:     '#dcfce7',
  warning:          '#f59e0b',
  warningLight:     '#fef3c7',
  danger:           '#ef4444',
  dangerLight:      '#fee2e2',
};
```

**If aligning to web ERP theme is required**, `constants/colors.ts` needs to change to:
- `primary: '#CC785C'` (terracotta)
- `background: '#FAF9F5'` (cream)
- `card: '#FFFFFF'` (surface)
- And all NativeWind class names that hardcode `slate-*` / `indigo-*` need updating

---

## Environment Config

```
# .env (not committed — in .gitignore)
EXPO_PUBLIC_API_URL=https://your-erp-domain.com
```

The `api.ts` client falls back to `http://localhost:3000` if `EXPO_PUBLIC_API_URL` is not set.

---

## What's Left To Build

### High priority — ✅ All done

1. ~~Reset password screen~~ — built into `forgot-password.tsx` (2-step flow)
2. ~~Homework detail~~ — `homework/[id].tsx` ✅
3. ~~Notification detail~~ — `notifications/[id].tsx` ✅
4. ~~Leave apply form~~ — `leaves/apply.tsx` ✅
5. ~~Token refresh~~ — `lib/api.ts` silent refresh interceptor ✅

### Medium priority (polish)

5. **`NoInternetBanner`** — needs `@react-native-community/netinfo` installed
6. **Skeleton loaders** — replace spinner with shimmer placeholder cards
7. **Theme alignment** — switch `constants/colors.ts` to terracotta to match web ERP

### Low priority / future phases

8. **Dark mode** — `DarkColors` already defined in plan; needs `ThemeContext`, `useTheme()` hook, update all screens
9. **Biometric unlock** — `expo-local-authentication` install + login screen toggle
10. **Push notifications** — `expo-notifications`, device token registration, background handler
11. **Online payments** — Razorpay SDK, payment initiation from Fees screen
12. **EAS Build** — `eas.json` config, iOS + Android build profiles, app store metadata
13. **Tests** — Jest + React Native Testing Library, unit tests for hooks/stores

---

## Git History Summary

| Commit | What was built |
|--------|---------------|
| `7d92b69` | Initial Expo app — project scaffold |
| `4a94f1f` | API shape fixes + leave requests screen |
| `25dc9f5` | Phase 1 fixes |
| `28016db` | More Phase 1 review fixes |
| `9b4db49` | Phase 2 — Homework + Timetable screens |
| `e5e3dc6` | Phase 3 — Profile Edit screen |
| `f953f28` | Phase 4 — Parent Portal child selection |
| `4b4b48d` | Phase 5 — Password management screens |
| `1f8fe97` | Notices/Announcements screen + hook |
| `839c9f9` | Notifications inbox with mark-as-read |
| `bd85387` | Fee receipt detail screen |
| `578884e` | Exam schedule screen (upcoming/all filter) |
| `6e6dc05` | Downgrade Expo SDK, swap expo-status-bar → expo-asset |
| `316a280` | Mobile plan phase files added |
| `210d321` | PROGRESS.md + CLAUDE.md + UI_REDESIGN_PROMPT.md added |
| `349ff48` | Detail screens (homework, notifications), leave apply screen, token refresh |

---

## Known Issues / Tech Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| Theme mismatch | Medium | App uses indigo, web ERP uses terracotta — visually inconsistent |
| No TanStack Query | Medium | Custom hooks don't cache, deduplicate requests, or handle stale data automatically |
| No token refresh | ✅ Fixed | Silent refresh interceptor in api.ts with request queue for concurrent 401s |
| Leave apply inline | ✅ Fixed | Dedicated leaves/apply.tsx screen, leaves.tsx uses useFocusEffect to refetch on back |
| `sectionId` not set | Low | `setStudentMeta` called with empty string for `sectionId` in dashboard — timetable may fail if sectionId required |
| No form validation | Medium | Change-password, edit-profile use manual state — no validation library |
| No offline support | Low | All screens show error if network unavailable — no cached data fallback |
