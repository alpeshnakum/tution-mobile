# OAC Student Mobile App — Planning Overview

React Native (Expo) mobile app for **students only**. Consumes the existing OAC ERP web APIs. No parent, teacher, admin, or super_admin access — this app is scoped exclusively to the `student` role.

---

## Key Rules (Read Before Building Any Phase)

1. **Student role only** — every screen, every API call is for `role === 'student'`
2. **Sidebar navigation** — Drawer Navigator (not bottom tabs). Hamburger icon (≡) in header opens/closes the sidebar
3. **Same theme as web** — terracotta primary (`#CC785C`), cream background (`#FAF9F5`), same radius scale, same status colours
4. **JWT on every request** — Axios interceptor injects `Authorization: Bearer <accessToken>` automatically
5. **Online only** — no offline caching. Show `NoInternetBanner` at top when network is unreachable
6. **Security** — `studentId` always taken from JWT payload on the backend — never trusted from URL params or request body
7. **No payments** — Razorpay integration is a future phase, not included in this plan
8. **API responses** — all ERP APIs return `{ success: true, data: ..., meta: { total, page } }`. Always unwrap `.data`
9. **After mutations** — call `queryClient.invalidateQueries()` on the affected query key to refresh data

---

## Tech Stack

| Layer | Package | Version | Purpose |
|-------|---------|---------|---------|
| Framework | expo | ~51.x | Managed workflow, OTA updates |
| Language | typescript | ^5.3 | Type safety |
| Navigation | @react-navigation/native | ^6.x | Base navigation container |
| Navigation | @react-navigation/drawer | ^6.x | **Sidebar drawer** (not bottom tabs) |
| Navigation | @react-navigation/stack | ^6.x | Stack screens within each drawer section |
| Styling | nativewind | ^4.x | Tailwind CSS in React Native |
| Styling | tailwindcss | ^3.4 | Tailwind config |
| State | zustand | ^4.x | AuthStore + StudentStore |
| Data | @tanstack/react-query | ^5.x | Server data fetching, caching, invalidation |
| HTTP | axios | ^1.x | API client with request/response interceptors |
| Storage | expo-secure-store | ~13.x | Encrypted refresh token (device keychain) |
| Storage | react-native-mmkv | ^2.x | Fast sync storage (access token, prefs) |
| Biometric | expo-local-authentication | ~14.x | Face ID / fingerprint unlock |
| Forms | react-hook-form | ^7.x | Form state management |
| Validation | zod | ^3.x | Schema validation (same approach as web ERP) |
| Icons | @expo/vector-icons | ^14.x | MaterialCommunityIcons |
| Gestures | react-native-gesture-handler | ~2.x | Required by React Navigation drawer |
| Animation | react-native-reanimated | ~3.x | Required by drawer animations |
| Safe area | react-native-safe-area-context | ^4.x | Device notch / status bar handling |
| Screens | react-native-screens | ~3.x | Native screen optimisation |
| Network | @react-native-community/netinfo | ^11.x | Detect internet connectivity |
| Date | date-fns | ^3.x | Date formatting |

---

## Theme — Exact Web Colours

Defined in `src/theme/colors.ts`. NativeWind `tailwind.config.js` maps these names to utilities like `bg-primary`, `text-foreground`, `bg-surface`, etc.

```ts
// Light mode (default)
export const LightColors = {
  primary:         '#CC785C',   // --brand-primary (terracotta)
  primaryHover:    '#B8684F',
  primaryPressed:  '#9E5742',
  primaryForeground: '#FFFFFF',

  background:      '#FAF9F5',   // --brand-bg (cream)
  surface:         '#FFFFFF',   // --brand-surface
  surfaceMuted:    '#F0EEE6',   // --brand-surface-muted

  foreground:      '#1F1E1D',   // --brand-ink
  mutedForeground: '#6B6862',   // --brand-ink-muted

  border:          '#E8E6DC',   // --brand-border
  inputBorder:     '#D6D3C7',   // --brand-input-border

  success:         '#5C8D5C',   // --brand-success
  warning:         '#C89B3C',   // --brand-warning
  error:           '#C44536',   // --brand-error (destructive)
  info:            '#6B8CAE',   // --brand-info
};

// Dark mode overrides
export const DarkColors = {
  ...LightColors,
  primary:         '#D97757',
  background:      '#1F1E1D',
  surface:         '#262624',
  surfaceMuted:    '#2E2D2A',
  foreground:      '#F0EEE6',
  mutedForeground: '#A8A49C',
  border:          '#3A3835',
  inputBorder:     '#4A4845',
};
```

Border radius (matching web `--radius` tokens):
```ts
export const Radius = { sm: 2, md: 4, base: 8, lg: 8, xl: 12 };
```

---

## Navigation Architecture

```
RootNavigator
├── AuthStack  ← shown when isAuthenticated === false
│   ├── LoginScreen
│   ├── ForgotPasswordScreen
│   └── ResetPasswordScreen
└── StudentDrawer  ← shown when isAuthenticated === true AND role === 'student'
    ├── DrawerContent  (custom sidebar: avatar header + menu items + logout footer)
    └── Stacks (each screen group is its own Stack inside the drawer):
        ├── DashboardStack   → DashboardScreen
        ├── AttendanceStack  → AttendanceScreen
        ├── FeesStack        → FeeScreen, FeeReceiptScreen
        ├── ResultsStack     → ResultsScreen
        ├── HomeworkStack    → HomeworkScreen, HomeworkDetailScreen
        ├── TimetableStack   → TimetableScreen
        ├── LeavesStack      → LeaveRequestsScreen, LeaveApplyScreen
        ├── NotificationsStack → NotificationsScreen, NotificationDetailScreen
        └── ProfileStack     → ProfileScreen, ChangePasswordScreen
```

**Drawer sidebar layout:**
- Header: circular avatar (student initials in primary colour), student name, class + section
- Menu items: icon + label. Active item: primary background tint, primary text colour
- Divider before bottom section
- Footer: App version text, Logout button (error/destructive colour)

Every screen header has a hamburger icon (≡) on the left that opens the drawer.

---

## API Base URL

Set in `.env`:
```
EXPO_PUBLIC_API_URL=https://your-erp-domain.com
```

All endpoint paths below are appended to this base URL.

---

## Phase Index

| # | File | Topic | New Backend APIs Needed? |
|---|------|-------|--------------------------|
| 1 | `phase-01-foundation-setup.md` | Expo project, theme, base components, stores, API client | No |
| 2 | `phase-02-auth-roles.md` | Login, forgot/reset password, drawer navigation, biometric | Yes |
| 3 | `phase-03-student-portal.md` | Dashboard screen | No |
| 4 | `phase-04-parent-portal.md` | Attendance screen | No |
| 5 | `phase-05-teacher-portal.md` | Fees screen + receipt viewer | No |
| 6 | `phase-06-branch-admin-portal.md` | Results screen | No |
| 7 | `phase-07-notifications-push.md` | Homework screens | No |
| 8 | `phase-08-online-payments.md` | Timetable screen | No |
| 9 | `phase-09-offline-performance.md` | Leave Requests screens | Yes |
| 10 | `phase-10-testing-deployment.md` | Notifications screen | No |
| 11 | `phase-11-profile.md` | Profile screen + change password | Yes |
| 12 | `phase-12-polish-deployment.md` | Dark mode, polish, EAS build + app store | No |

---

## New Backend APIs (build in web ERP before mobile phase starts)

| Phase | Endpoint | Method | Description |
|-------|----------|--------|-------------|
| 2 | `/api/auth/forgot-password` | POST | Accept username or email, generate 6-digit OTP, store in DB with 10-min expiry |
| 2 | `/api/auth/reset-password` | POST | Verify OTP, update password hash, delete OTP record |
| 9 | `/api/portal/student/leaves` | GET | List authenticated student's leave applications (paginated) |
| 9 | `/api/portal/student/leaves` | POST | Submit new leave application (studentId from JWT, not body) |
| 9 | `/api/portal/student/leaves/:id` | DELETE | Soft-cancel a pending leave (status=cancelled) — 400 if not pending |
| 11 | `/api/portal/student/profile` | PUT | Update own phone/email/address only — studentId from JWT |
| 11 | `/api/auth/change-password` | PUT | Verify currentPassword, update to newPassword — userId from JWT |

---

## Project Folder Structure

```
student-app/
├── assets/
│   ├── fonts/
│   └── images/logo.png
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   ├── AppButton.tsx
│   │   │   ├── AppInput.tsx
│   │   │   ├── AppCard.tsx
│   │   │   ├── AppBadge.tsx
│   │   │   ├── AppLoader.tsx
│   │   │   ├── AppEmptyState.tsx
│   │   │   ├── AppErrorBoundary.tsx
│   │   │   ├── AppToast.tsx
│   │   │   ├── NoInternetBanner.tsx
│   │   │   └── SkeletonBlock.tsx
│   │   ├── dashboard/
│   │   │   ├── WelcomeCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── UpcomingExamsList.tsx
│   │   │   ├── RecentResultsPreview.tsx
│   │   │   └── NotificationsPreview.tsx
│   │   ├── attendance/
│   │   │   ├── AttendanceCalendar.tsx
│   │   │   ├── MonthNavigator.tsx
│   │   │   ├── AttendanceSummaryBar.tsx
│   │   │   └── DailyAttendanceList.tsx
│   │   ├── fees/
│   │   │   ├── TotalsBanner.tsx
│   │   │   ├── InstallmentAccordion.tsx
│   │   │   ├── FeeHeadBreakdown.tsx
│   │   │   └── PaymentHistoryList.tsx
│   │   ├── results/
│   │   │   ├── ResultCard.tsx
│   │   │   ├── SessionDropdown.tsx
│   │   │   └── ExamTypeFilterChips.tsx
│   │   ├── homework/
│   │   │   └── HomeworkCard.tsx
│   │   ├── timetable/
│   │   │   ├── DayTabs.tsx
│   │   │   └── PeriodCard.tsx
│   │   ├── leaves/
│   │   │   └── LeaveCard.tsx
│   │   └── notifications/
│   │       └── NotificationRow.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── ResetPasswordScreen.tsx
│   │   ├── dashboard/DashboardScreen.tsx
│   │   ├── attendance/AttendanceScreen.tsx
│   │   ├── fees/
│   │   │   ├── FeeScreen.tsx
│   │   │   └── FeeReceiptScreen.tsx
│   │   ├── results/ResultsScreen.tsx
│   │   ├── homework/
│   │   │   ├── HomeworkScreen.tsx
│   │   │   └── HomeworkDetailScreen.tsx
│   │   ├── timetable/TimetableScreen.tsx
│   │   ├── leaves/
│   │   │   ├── LeaveRequestsScreen.tsx
│   │   │   └── LeaveApplyScreen.tsx
│   │   ├── notifications/
│   │   │   ├── NotificationsScreen.tsx
│   │   │   └── NotificationDetailScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       └── ChangePasswordScreen.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── StudentDrawer.tsx
│   │   └── DrawerContent.tsx
│   ├── stores/
│   │   ├── auth-store.ts
│   │   └── student-store.ts
│   ├── services/
│   │   ├── api-client.ts
│   │   └── auth-service.ts
│   ├── hooks/
│   │   ├── use-session-restore.ts
│   │   ├── use-logout.ts
│   │   └── use-biometric.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── radius.ts
│   │   └── typography.ts
│   └── types/
│       ├── api.ts
│       ├── navigation.ts
│       └── models.ts
├── .env
├── app.json
├── tailwind.config.js
├── babel.config.js
└── tsconfig.json
```
