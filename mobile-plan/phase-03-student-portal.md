# Phase 03 — Dashboard Screen

> **Goal:** Build the student Dashboard screen — the first screen after login. Shows a personalised welcome, quick stat cards, upcoming exams, recent results preview, and notification preview. Also populates `useStudentStore` with the full student details returned by the dashboard API.
>
> **Depends on:** Phase 01 (base components, stores, API client) + Phase 02 (auth + drawer navigation) complete.
>
> **No new backend APIs required.** Uses existing `GET /api/portal/student/dashboard`.

---

## 1. API Contract

### `GET /api/portal/student/dashboard`

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id":            "abc123",
      "studentId":      "abc123",
      "admissionNumber":"ADM2425001",
      "name":           "Ravi Patel",
      "rollNumber":     "15",
      "phone":          "9876543210",
      "email":          "ravi@email.com",
      "address":        "123 Main St, Ahmedabad",
      "dateOfBirth":    "2008-06-15T00:00:00.000Z",
      "gender":         "Male",
      "bloodGroup":     "O+",
      "classId":        "class_id",
      "sectionId":      "section_id",
      "sessionId":      "session_id",
      "branchId":       "branch_id",
      "className":      "Class 10",
      "sectionName":    "A",
      "sessionName":    "2024-25"
    },
    "stats": {
      "attendancePercentage": 87.5,
      "feesDue":              2500,
      "upcomingExamsCount":   3
    },
    "upcomingExams": [
      {
        "_id":         "exam1",
        "examName":    "Unit Test 1",
        "subjectName": "Mathematics",
        "examDate":    "2025-06-10T00:00:00.000Z",
        "examType":    "unit_test"
      }
    ],
    "recentResults": [
      {
        "_id":         "result1",
        "examName":    "Mid Term",
        "subjectName": "Science",
        "marksObtained":38,
        "totalMarks":   50,
        "grade":        "A",
        "isPassed":     true
      }
    ],
    "recentNotifications": [
      {
        "_id":       "notif1",
        "title":     "Exam Schedule Released",
        "body":      "Final exam timetable has been published.",
        "isRead":    false,
        "createdAt": "2025-05-17T10:00:00.000Z"
      }
    ]
  },
  "error": null
}
```

---

## 2. TypeScript Types

Add to `src/types/models.ts`:

```ts
export interface DashboardStats {
  attendancePercentage: number;
  feesDue:              number;
  upcomingExamsCount:   number;
}

export interface UpcomingExam {
  _id:        string;
  examName:   string;
  subjectName:string;
  examDate:   string;
  examType:   string;
}

export interface RecentResult {
  _id:           string;
  examName:      string;
  subjectName:   string;
  marksObtained: number;
  totalMarks:    number;
  grade:         string;
  isPassed:      boolean;
}

export interface RecentNotification {
  _id:       string;
  title:     string;
  body:      string;
  isRead:    boolean;
  createdAt: string;
}

export interface DashboardData {
  student:              Student;       // from models.ts
  stats:                DashboardStats;
  upcomingExams:        UpcomingExam[];
  recentResults:        RecentResult[];
  recentNotifications:  RecentNotification[];
}
```

---

## 3. New Files to Create

```
src/screens/dashboard/DashboardScreen.tsx       ← main screen
src/components/dashboard/WelcomeCard.tsx
src/components/dashboard/StatCard.tsx
src/components/dashboard/UpcomingExamsList.tsx
src/components/dashboard/RecentResultsPreview.tsx
src/components/dashboard/NotificationsPreview.tsx
src/components/dashboard/DashboardSkeleton.tsx
```

---

## 4. Component Specifications

### `WelcomeCard.tsx`

**Props:**
```ts
interface WelcomeCardProps {
  name:        string;
  className:   string;
  sectionName: string;
  rollNumber:  string;
}
```

**Visual:**
- Background: `bg-primary` (terracotta)
- Large circular avatar: student's initials (first 2 chars, uppercase), `bg-white/20` background, `text-white` text
- Name: `text-xl font-bold text-white`
- Class + Section + Roll: `text-sm text-white/80`
- Greeting based on time: "Good Morning / Afternoon / Evening, {firstName}!"

---

### `StatCard.tsx`

**Props:**
```ts
interface StatCardProps {
  icon:    string;   // MaterialCommunityIcons name
  label:   string;
  value:   string;
  variant: 'default' | 'warning' | 'success' | 'info';
}
```

**Visual:**
- Small card (`AppCard` with `padding="sm"`)
- Icon circle at top (background tinted to variant colour)
- Value: `text-xl font-bold text-foreground`
- Label: `text-xs text-muted`

**Three stat cards on dashboard:**
| Icon | Label | Value | Variant |
|------|-------|-------|---------|
| `calendar-check-outline` | Attendance | `87.5%` | `stats.attendancePercentage >= 75 ? 'success' : 'warning'` |
| `currency-inr` | Fees Due | `₹2,500` | `stats.feesDue > 0 ? 'warning' : 'success'` |
| `file-document-edit-outline` | Upcoming Exams | `3` | `'info'` |

---

### `UpcomingExamsList.tsx`

**Props:**
```ts
interface UpcomingExamsListProps {
  exams: UpcomingExam[];
}
```

**Visual:**
- Section title: "Upcoming Exams"
- If empty: small inline message "No upcoming exams"
- Each exam row: date badge (day+month), exam name, subject name, exam type badge
- Date badge: `bg-primary/10 text-primary`, shows day (big) + month abbr (small)
- Max 3 rows, "View All" link if more

---

### `RecentResultsPreview.tsx`

**Props:**
```ts
interface RecentResultsPreviewProps {
  results: RecentResult[];
}
```

**Visual:**
- Section title: "Recent Results"
- If empty: small inline message "No results yet"
- Each row: subject name, exam name, marks (`38/50`), grade badge (colour-coded same as web)

**Grade badge colours (same as web ERP):**
```ts
const gradeColour = (grade: string): BadgeVariant => {
  if (['A+', 'A'].includes(grade)) return 'success';
  if (['B+', 'B'].includes(grade)) return 'info';
  if (['C+', 'C'].includes(grade)) return 'warning';
  return 'destructive'; // D, F
};
```

---

### `NotificationsPreview.tsx`

**Props:**
```ts
interface NotificationsPreviewProps {
  notifications: RecentNotification[];
}
```

**Visual:**
- Section title: "Notifications" + unread count badge (if > 0)
- Each row: title (bold if unread), time (relative), blue dot if `!isRead`
- Max 3 rows, "View All" link navigates to NotificationsStack

---

### `DashboardSkeleton.tsx`

Shown while API data is loading. Compose `SkeletonBlock` components to mimic the real layout:
- Welcome card placeholder: full-width block, height 100, rounded-xl
- 3 stat card placeholders: row of 3 equal blocks, height 80
- Section title placeholder + 3 row placeholders for exams and results

---

## 5. Dashboard Screen

### `src/screens/dashboard/DashboardScreen.tsx`

```tsx
import React from 'react';
import { ScrollView, RefreshControl, View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient }             from '../../services/api-client';
import { useStudentStore }       from '../../stores/student-store';
import { WelcomeCard }           from '../../components/dashboard/WelcomeCard';
import { StatCard }              from '../../components/dashboard/StatCard';
import { UpcomingExamsList }     from '../../components/dashboard/UpcomingExamsList';
import { RecentResultsPreview }  from '../../components/dashboard/RecentResultsPreview';
import { NotificationsPreview }  from '../../components/dashboard/NotificationsPreview';
import { DashboardSkeleton }     from '../../components/dashboard/DashboardSkeleton';
import { NoInternetBanner }      from '../../components/shared/NoInternetBanner';
import { AppEmptyState }         from '../../components/shared/AppEmptyState';
import { formatCurrency }        from '../../utils/format';
import type { ApiResponse, DashboardData } from '../../types/api';

async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<ApiResponse<DashboardData>>('/api/portal/student/dashboard');
  return data.data;
}

export function DashboardScreen() {
  const { setStudentInfo } = useStudentStore();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn:  fetchDashboard,
  });

  // Populate student store when data loads (keeps store fresh)
  React.useEffect(() => {
    if (data?.student) {
      const s = data.student;
      setStudentInfo({
        studentId:   s.studentId,
        studentName: s.name,
        classId:     s.classId,
        sectionId:   s.sectionId,
        sessionId:   s.sessionId,
        branchId:    s.branchId,
        className:   s.className ?? null,
        sectionName: s.sectionName ?? null,
        rollNumber:  s.rollNumber ?? null,
      });
    }
  }, [data?.student]);

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <AppEmptyState
        icon="alert-circle-outline"
        title="Could not load dashboard"
        description="Check your connection and try again."
        ctaLabel="Retry"
        onCta={() => refetch()}
      />
    );
  }

  if (!data) return null;

  const { student, stats, upcomingExams, recentResults, recentNotifications } = data;

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#CC785C" />}
    >
      <NoInternetBanner />

      {/* Welcome card */}
      <View className="px-4 pt-4">
        <WelcomeCard
          name={student.name}
          className={student.className ?? ''}
          sectionName={student.sectionName ?? ''}
          rollNumber={student.rollNumber ?? ''}
        />
      </View>

      {/* Stat cards row */}
      <View className="flex-row px-4 mt-4 gap-3">
        <StatCard
          icon="calendar-check-outline"
          label="Attendance"
          value={`${stats.attendancePercentage.toFixed(1)}%`}
          variant={stats.attendancePercentage >= 75 ? 'success' : 'warning'}
        />
        <StatCard
          icon="currency-inr"
          label="Fees Due"
          value={formatCurrency(stats.feesDue)}
          variant={stats.feesDue > 0 ? 'warning' : 'success'}
        />
        <StatCard
          icon="file-document-edit-outline"
          label="Exams"
          value={String(stats.upcomingExamsCount)}
          variant="info"
        />
      </View>

      {/* Upcoming exams */}
      <View className="px-4 mt-5">
        <UpcomingExamsList exams={upcomingExams} />
      </View>

      {/* Recent results */}
      <View className="px-4 mt-5">
        <RecentResultsPreview results={recentResults} />
      </View>

      {/* Notifications preview */}
      <View className="px-4 mt-5 mb-6">
        <NotificationsPreview notifications={recentNotifications} />
      </View>
    </ScrollView>
  );
}
```

---

## 6. Implementation Steps (in order)

1. Add `DashboardData`, `DashboardStats`, `UpcomingExam`, `RecentResult`, `RecentNotification` to `src/types/models.ts`
2. Build `DashboardSkeleton.tsx`
3. Build `WelcomeCard.tsx`
4. Build `StatCard.tsx`
5. Build `UpcomingExamsList.tsx`
6. Build `RecentResultsPreview.tsx` (with `gradeColour` helper)
7. Build `NotificationsPreview.tsx`
8. Build `DashboardScreen.tsx`
9. Replace the stub `DashboardScreen` in `src/screens/dashboard/DashboardScreen.tsx`

---

## 7. Verification Checklist

- [ ] Dashboard loads and shows real data from API (not mock)
- [ ] Student name, class, section, roll number appear in WelcomeCard
- [ ] `useStudentStore` is populated after dashboard loads (check by navigating to drawer header)
- [ ] Attendance % shows green badge when >= 75, amber when below
- [ ] Fees Due shows "₹0" and green when no dues
- [ ] Upcoming exams list shows correct dates
- [ ] Grade badges use correct colours matching web ERP
- [ ] Pull-to-refresh refetches and updates data
- [ ] Skeleton shown while loading
- [ ] Error state shown with "Retry" button on network failure
- [ ] `NoInternetBanner` appears when wifi off
- [ ] TypeScript: `npx tsc --noEmit` passes
