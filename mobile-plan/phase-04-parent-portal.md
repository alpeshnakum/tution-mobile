# Phase 04 — Attendance Screen

> **Goal:** Build the Attendance screen. Student can view monthly attendance summary, navigate between months, see a colour-coded calendar grid, and a day-by-day record list below the calendar.
>
> **Depends on:** Phase 01 + 02 complete. `useStudentStore` must have `studentId` and `branchId` (populated by Phase 03 dashboard load).
>
> **No new backend APIs required.** Uses existing `GET /api/portal/student/attendance`.

---

## 1. API Contract

### `GET /api/portal/student/attendance?month=5&year=2025`

**Headers:** `Authorization: Bearer <accessToken>`

**Query params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `month` | number | Yes | Month number (1–12) |
| `year` | number | Yes | 4-digit year |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "present": 18,
      "absent":  3,
      "leave":   2,
      "holiday": 1,
      "total":   24,
      "percentage": 85.7
    },
    "records": [
      {
        "_id":       "att1",
        "date":      "2025-05-01T00:00:00.000Z",
        "status":    "present",
        "subjectName": null,
        "remarks":   null
      },
      {
        "_id":       "att2",
        "date":      "2025-05-03T00:00:00.000Z",
        "status":    "absent",
        "subjectName": null,
        "remarks":   "Sick"
      }
    ]
  },
  "error": null
}
```

**Attendance status values:** `"present"` | `"absent"` | `"leave"` | `"holiday"` | `"half_day"`

---

## 2. TypeScript Types

Add to `src/types/models.ts`:

```ts
export interface AttendanceSummary {
  present:    number;
  absent:     number;
  leave:      number;
  holiday:    number;
  total:      number;
  percentage: number;
}

export interface AttendanceRecord {
  _id:         string;
  date:        string;   // ISO date string
  status:      AttendanceStatus;
  subjectName: string | null;
  remarks:     string | null;
}

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday' | 'half_day';

export interface AttendanceData {
  summary: AttendanceSummary;
  records: AttendanceRecord[];
}
```

---

## 3. New Files to Create

```
src/screens/attendance/AttendanceScreen.tsx
src/components/attendance/AttendanceSummaryBar.tsx
src/components/attendance/MonthNavigator.tsx
src/components/attendance/AttendanceCalendar.tsx
src/components/attendance/DailyAttendanceList.tsx
src/components/attendance/AttendanceSkeleton.tsx
```

---

## 4. Attendance Status Colour Map

Used in both the calendar and the daily list:

```ts
// src/utils/attendance.ts
import type { AttendanceStatus } from '../types/models';

export const attendanceStatusConfig: Record<AttendanceStatus, { bg: string; text: string; label: string }> = {
  present:  { bg: '#5C8D5C',   text: '#FFFFFF', label: 'Present'  },
  absent:   { bg: '#C44536',   text: '#FFFFFF', label: 'Absent'   },
  leave:    { bg: '#C89B3C',   text: '#FFFFFF', label: 'Leave'    },
  holiday:  { bg: '#6B8CAE',   text: '#FFFFFF', label: 'Holiday'  },
  half_day: { bg: '#CC785C',   text: '#FFFFFF', label: 'Half Day' },
};
```

---

## 5. Component Specifications

### `AttendanceSummaryBar.tsx`

**Props:**
```ts
interface AttendanceSummaryBarProps {
  summary: AttendanceSummary;
}
```

**Visual:**
- Row of 4 stat chips: Present (green), Absent (red), Leave (amber), %
- Each chip: count (bold) + label (small muted)
- Percentage chip is slightly larger with `text-primary font-bold`
- Horizontal scroll if needed on small screens

---

### `MonthNavigator.tsx`

**Props:**
```ts
interface MonthNavigatorProps {
  month:    number;   // 1–12
  year:     number;   // e.g. 2025
  onPrev:   () => void;
  onNext:   () => void;
  canGoNext:boolean;  // false if current or future month
}
```

**Visual:**
- `← May 2025 →`
- Left arrow: always enabled
- Right arrow: disabled (grey) if `canGoNext === false` (cannot view future months)
- Month+year text: `text-base font-semibold text-foreground`
- Arrows: `MaterialCommunityIcons` `chevron-left` / `chevron-right`

**Logic for `canGoNext`:**
```ts
const canGoNext = !(month === currentMonth && year === currentYear);
```

---

### `AttendanceCalendar.tsx`

**Props:**
```ts
interface AttendanceCalendarProps {
  month:   number;
  year:    number;
  records: AttendanceRecord[];
}
```

**Visual:**
- 7-column grid (Mon–Sun header row)
- Each day cell: date number in centre. Background colour based on status:
  - Present: `#5C8D5C` (green)
  - Absent: `#C44536` (red)
  - Leave: `#C89B3C` (amber)
  - Holiday: `#6B8CAE` (blue-grey)
  - Half day: `#CC785C` (terracotta)
  - No record / weekend: `transparent` (grey date number)
- Current date: ring border `border-primary`
- Cells are square (use `aspectRatio: 1`)

**Implementation approach:**
1. Generate array of days for the month using `date-fns/getDaysInMonth` and `date-fns/startOfMonth` (to know which day of week the 1st falls on)
2. Pad start of grid with empty cells for the correct weekday offset
3. Build a lookup `Map<string, AttendanceStatus>` from records (`date.slice(0,10)` as key)
4. Render a `FlatList` with `numColumns={7}` or a `View` with `flexWrap: 'wrap'`

---

### `DailyAttendanceList.tsx`

**Props:**
```ts
interface DailyAttendanceListProps {
  records: AttendanceRecord[];
}
```

**Visual:**
- Section title: "Daily Records"
- Records sorted descending by date (most recent first)
- Each row: date (formatted "Mon, 12 May"), status badge (colour-coded), remarks text if any
- Empty state: "No attendance records for this month"

---

### `AttendanceSkeleton.tsx`

Skeleton placeholders for:
- Summary bar: row of 4 equal blocks, height 60
- Month navigator: centred block, width 200, height 30
- Calendar: 7×5 grid of square blocks
- Daily list: 5 rows of height 48

---

## 6. Attendance Screen

### `src/screens/attendance/AttendanceScreen.tsx`

```tsx
import React, { useState } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getMonth, getYear } from 'date-fns';
import { apiClient }               from '../../services/api-client';
import { AttendanceSummaryBar }    from '../../components/attendance/AttendanceSummaryBar';
import { MonthNavigator }          from '../../components/attendance/MonthNavigator';
import { AttendanceCalendar }      from '../../components/attendance/AttendanceCalendar';
import { DailyAttendanceList }     from '../../components/attendance/DailyAttendanceList';
import { AttendanceSkeleton }      from '../../components/attendance/AttendanceSkeleton';
import { NoInternetBanner }        from '../../components/shared/NoInternetBanner';
import { AppEmptyState }           from '../../components/shared/AppEmptyState';
import type { ApiResponse, AttendanceData } from '../../types/api';

const today = new Date();
const CURRENT_MONTH = getMonth(today) + 1; // 1-indexed
const CURRENT_YEAR  = getYear(today);

async function fetchAttendance(month: number, year: number): Promise<AttendanceData> {
  const { data } = await apiClient.get<ApiResponse<AttendanceData>>(
    `/api/portal/student/attendance?month=${month}&year=${year}`,
  );
  return data.data;
}

export function AttendanceScreen() {
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year,  setYear]  = useState(CURRENT_YEAR);

  const canGoNext = !(month === CURRENT_MONTH && year === CURRENT_YEAR);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['attendance', month, year],
    queryFn:  () => fetchAttendance(month, year),
  });

  function goToPrevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else { setMonth((m) => m - 1); }
  }

  function goToNextMonth() {
    if (!canGoNext) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else { setMonth((m) => m + 1); }
  }

  if (isLoading) return <AttendanceSkeleton />;

  if (isError) {
    return (
      <AppEmptyState
        icon="alert-circle-outline"
        title="Could not load attendance"
        description="Check your connection and try again."
        ctaLabel="Retry"
        onCta={() => refetch()}
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#CC785C" />}
    >
      <NoInternetBanner />

      <View className="px-4 pt-4">
        {/* Summary bar */}
        {data && <AttendanceSummaryBar summary={data.summary} />}

        {/* Month navigator */}
        <View className="mt-4">
          <MonthNavigator
            month={month}
            year={year}
            onPrev={goToPrevMonth}
            onNext={goToNextMonth}
            canGoNext={canGoNext}
          />
        </View>

        {/* Calendar */}
        <View className="mt-4">
          <AttendanceCalendar
            month={month}
            year={year}
            records={data?.records ?? []}
          />
        </View>

        {/* Daily list */}
        <View className="mt-4 mb-6">
          <DailyAttendanceList records={data?.records ?? []} />
        </View>
      </View>
    </ScrollView>
  );
}
```

---

## 7. Implementation Steps (in order)

1. Add attendance types to `src/types/models.ts`
2. Create `src/utils/attendance.ts` with `attendanceStatusConfig`
3. Build `AttendanceSkeleton.tsx`
4. Build `AttendanceSummaryBar.tsx`
5. Build `MonthNavigator.tsx`
6. Build `AttendanceCalendar.tsx` (most complex — build the grid logic carefully)
7. Build `DailyAttendanceList.tsx`
8. Build `AttendanceScreen.tsx`
9. Replace stub screen in `src/screens/attendance/AttendanceScreen.tsx`

---

## 8. Verification Checklist

- [ ] Attendance screen loads with current month data
- [ ] Summary bar shows correct present / absent / leave counts
- [ ] Calendar renders correct number of days for the month
- [ ] First day of month starts on correct weekday column
- [ ] Present days are green, absent are red, leave are amber
- [ ] Days with no record have no background colour
- [ ] Tapping ← goes to previous month and reloads data
- [ ] Tapping → is disabled on current month
- [ ] Previous months load correctly with their data
- [ ] Daily records list is sorted most recent first
- [ ] Pull-to-refresh reloads current month data
- [ ] Skeleton shown while loading
- [ ] Error state shown with Retry on network failure
- [ ] TypeScript: `npx tsc --noEmit` passes
