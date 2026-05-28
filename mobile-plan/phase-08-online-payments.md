# Phase 08 — Timetable Screen

> **Goal:** Build the Timetable screen. Student can view their class timetable for each day of the week in a day-tab layout, showing period cards with subject, teacher, time slot, and room.
>
> **Depends on:** Phase 01 + 02 complete. `useStudentStore` must have `classId`, `sectionId`, `sessionId`, `branchId` (populated by Phase 03).
>
> **No new backend APIs required.** Uses existing `GET /api/timetable`.

---

## 1. API Contract

### `GET /api/timetable?classId=<id>&sectionId=<id>&sessionId=<id>&branchId=<id>`

All params come from `useStudentStore`. All are required.

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "data": {
    "timetable": {
      "_id":       "tt1",
      "classId":   "class_id",
      "sectionId": "section_id",
      "sessionId": "session_id",
      "branchId":  "branch_id",
      "days": {
        "Monday": [
          {
            "period":     1,
            "startTime":  "08:00",
            "endTime":    "08:45",
            "subjectName":"Mathematics",
            "teacherName":"Mr. Sharma",
            "room":       "Room 201"
          },
          {
            "period":     2,
            "startTime":  "08:45",
            "endTime":    "09:30",
            "subjectName":"English",
            "teacherName":"Ms. Patel",
            "room":       null
          }
        ],
        "Tuesday": [],
        "Wednesday": [],
        "Thursday": [],
        "Friday": [],
        "Saturday": []
      }
    }
  },
  "error": null
}
```

**Notes:**
- Days with no classes have empty arrays `[]`
- `startTime` / `endTime` are 24-hour time strings `"HH:mm"`
- `room` may be null if not set
- The timetable document covers the entire week; one document per `{classId, sectionId, sessionId, branchId}`

---

## 2. TypeScript Types

Add to `src/types/models.ts`:

```ts
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetablePeriod {
  period:      number;
  startTime:   string;   // "HH:mm"
  endTime:     string;   // "HH:mm"
  subjectName: string;
  teacherName: string;
  room:        string | null;
}

export type TimetableDays = {
  [key in DayOfWeek]: TimetablePeriod[];
};

export interface TimetableData {
  timetable: {
    _id:       string;
    classId:   string;
    sectionId: string;
    sessionId: string;
    branchId:  string;
    days:      TimetableDays;
  } | null;
}
```

---

## 3. New Files to Create

```
src/screens/timetable/TimetableScreen.tsx
src/components/timetable/DayTabs.tsx
src/components/timetable/PeriodCard.tsx
src/components/timetable/TimetableSkeleton.tsx
src/utils/timetable.ts
```

---

## 4. Timetable Utilities

### `src/utils/timetable.ts`

```ts
import { getDay } from 'date-fns';
import type { DayOfWeek } from '../types/models';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

// Returns today's day name (Mon-Sat), defaults to 'Monday' if Sunday
export function getTodayDayName(): DayOfWeek {
  const dayIndex = getDay(new Date()); // 0=Sun, 1=Mon ... 6=Sat
  if (dayIndex === 0) return 'Monday'; // Sunday → default to Monday
  const dayNames: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[dayIndex - 1];
}

// Format time from "HH:mm" to "8:00 AM" format
export function formatTime(time: string): string {
  const [hourStr, min] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12  = hour % 12 || 12;
  return `${h12}:${min} ${ampm}`;
}

// Abbreviated day labels for tabs
export const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  Monday:    'Mon',
  Tuesday:   'Tue',
  Wednesday: 'Wed',
  Thursday:  'Thu',
  Friday:    'Fri',
  Saturday:  'Sat',
};
```

---

## 5. Component Specifications

### `DayTabs.tsx`

**Props:**
```ts
interface DayTabsProps {
  selectedDay: DayOfWeek;
  onChange:    (day: DayOfWeek) => void;
  days:        DayOfWeek[];           // which days have content (non-empty)
}
```

**Visual:**
- Horizontal scrollable row of day tabs: Mon | Tue | Wed | Thu | Fri | Sat
- Selected tab: `bg-primary text-white rounded-lg`
- Unselected tab: `bg-transparent text-muted`
- Today's tab: thin underline indicator even when not selected
- Tabs that have no periods (empty array): slightly dimmer but still tappable
- Tab width: fixed (e.g., 44px each) so they all fit on screen without scrolling on most devices, but scroll on small devices

---

### `PeriodCard.tsx`

**Props:**
```ts
interface PeriodCardProps {
  period: TimetablePeriod;
}
```

**Visual:**
```
┌─────��───────────────────────────────────────────┐
│ P1   8:00 AM – 8:45 AM              Room 201    │
│                                                  │
│ Mathematics                                      │
│ Mr. Sharma                                       │
└─────────────────────────────────────────────────┘
```

- Period number: `P1` — small badge `bg-primary/10 text-primary` (top-left)
- Time range: `text-xs text-muted` (top-right)
- Subject name: `text-base font-semibold text-foreground`
- Teacher name: `text-sm text-muted` with teacher icon
- Room: `text-xs text-muted` with map-marker icon (hidden if null)
- Left border: 3px solid `primary` colour (visual accent)

---

### `TimetableSkeleton.tsx`

Skeleton placeholders:
- Day tabs row: 6 tabs of width 44, height 36
- 4 period card placeholders: height 80 each

---

## 6. Timetable Screen

### `src/screens/timetable/TimetableScreen.tsx`

```tsx
import React, { useState } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient }                   from '../../services/api-client';
import { useStudentStore }             from '../../stores/student-store';
import { DayTabs }                     from '../../components/timetable/DayTabs';
import { PeriodCard }                  from '../../components/timetable/PeriodCard';
import { TimetableSkeleton }           from '../../components/timetable/TimetableSkeleton';
import { NoInternetBanner }            from '../../components/shared/NoInternetBanner';
import { AppEmptyState }               from '../../components/shared/AppEmptyState';
import { DAYS_OF_WEEK, getTodayDayName } from '../../utils/timetable';
import type { ApiResponse, TimetableData, DayOfWeek } from '../../types/api';

async function fetchTimetable(
  classId: string, sectionId: string, sessionId: string, branchId: string,
): Promise<TimetableData> {
  const params = new URLSearchParams({ classId, sectionId, sessionId, branchId });
  const { data } = await apiClient.get<ApiResponse<TimetableData>>(
    `/api/timetable?${params.toString()}`,
  );
  return data.data;
}

export function TimetableScreen() {
  const { classId, sectionId, sessionId, branchId } = useStudentStore();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayDayName());

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['timetable', classId, sectionId, sessionId],
    queryFn:  () => fetchTimetable(classId!, sectionId!, sessionId!, branchId!),
    enabled:  !!(classId && sectionId && sessionId && branchId),
  });

  if (isLoading) return <TimetableSkeleton />;

  if (isError) {
    return (
      <AppEmptyState
        icon="alert-circle-outline"
        title="Could not load timetable"
        ctaLabel="Retry"
        onCta={() => refetch()}
      />
    );
  }

  if (!data?.timetable) {
    return (
      <AppEmptyState
        icon="timetable"
        title="No timetable yet"
        description="Timetable hasn't been set up for your class."
      />
    );
  }

  const { days } = data.timetable;
  const periodsForDay = days[selectedDay] ?? [];

  return (
    <View className="flex-1 bg-background">
      <NoInternetBanner />

      {/* Day tabs — fixed at top, not inside scroll */}
      <View className="px-4 pt-4 pb-2 bg-background border-b border-border">
        <DayTabs
          selectedDay={selectedDay}
          onChange={setSelectedDay}
          days={DAYS_OF_WEEK}
        />
      </View>

      {/* Periods for selected day */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#CC785C" />}
      >
        {periodsForDay.length === 0 ? (
          <AppEmptyState
            icon="coffee-outline"
            title="No classes today"
            description={`No periods scheduled for ${selectedDay}.`}
          />
        ) : (
          periodsForDay.map((period) => (
            <View key={period.period} className="mb-3">
              <PeriodCard period={period} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
```

---

## 7. Implementation Steps (in order)

1. Add timetable types to `src/types/models.ts`
2. Create `src/utils/timetable.ts`
3. Build `TimetableSkeleton.tsx`
4. Build `DayTabs.tsx` (with today indicator)
5. Build `PeriodCard.tsx`
6. Build `TimetableScreen.tsx`
7. Replace stub screen

---

## 8. Verification Checklist

- [ ] Timetable screen loads with correct data for student's class
- [ ] Default selected tab is today's day of week
- [ ] Selecting different day tabs shows correct periods for that day
- [ ] Days with no periods show "No classes today" empty state
- [ ] Period card shows: period number, time range, subject, teacher, room (if set)
- [ ] Room hidden/absent when null in data
- [ ] "No timetable yet" state shown if no timetable document exists for class
- [ ] Pull-to-refresh reloads timetable
- [ ] Day tabs scroll horizontally on small devices
- [ ] TypeScript: `npx tsc --noEmit` passes
