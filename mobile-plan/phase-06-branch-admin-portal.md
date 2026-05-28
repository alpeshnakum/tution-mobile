# Phase 06 — Results Screen

> **Goal:** Build the Results screen. Student can filter by academic session and exam type, then view result cards for each subject with marks, percentage, grade badge (colour-coded same as web ERP), pass/fail status, and rank.
>
> **Depends on:** Phase 01 + 02 complete. `useStudentStore` must have `branchId` and `sessionId` (populated by Phase 03).
>
> **No new backend APIs required.** Uses existing `/api/portal/student/results` and `/api/sessions`.

---

## 1. API Contracts

### `GET /api/sessions?branchId=<branchId>`

Used to populate the session dropdown.

**Response:**
```json
{
  "success": true,
  "data": [
    { "_id": "sess1", "name": "2024-25", "isActive": true,  "startYear": 2024, "endYear": 2025 },
    { "_id": "sess2", "name": "2023-24", "isActive": false, "startYear": 2023, "endYear": 2024 }
  ],
  "error": null
}
```

---

### `GET /api/portal/student/results?sessionId=<id>&examTypeId=<id>`

**Query params:**
| Param | Required | Description |
|-------|----------|-------------|
| `sessionId` | Yes | Filter by session |
| `examTypeId` | No | Filter by exam type (omit to show all) |

**Response:**
```json
{
  "success": true,
  "data": {
    "examTypes": [
      { "_id": "et1", "name": "Unit Test 1" },
      { "_id": "et2", "name": "Mid Term" },
      { "_id": "et3", "name": "Final Exam" }
    ],
    "results": [
      {
        "_id":          "res1",
        "examName":     "Mid Term",
        "examType":     { "_id": "et2", "name": "Mid Term" },
        "examDate":     "2025-02-15T00:00:00.000Z",
        "subjectName":  "Mathematics",
        "marksObtained":42,
        "totalMarks":   50,
        "percentage":   84.0,
        "grade":        "A",
        "isPassed":     true,
        "rank":         5,
        "remarks":      null
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
export interface ExamType {
  _id:  string;
  name: string;
}

export interface ResultItem {
  _id:           string;
  examName:      string;
  examType:      ExamType;
  examDate:      string;
  subjectName:   string;
  marksObtained: number;
  totalMarks:    number;
  percentage:    number;
  grade:         string;
  isPassed:      boolean;
  rank:          number | null;
  remarks:       string | null;
}

export interface ResultsData {
  examTypes: ExamType[];
  results:   ResultItem[];
}
```

---

## 3. New Files to Create

```
src/screens/results/ResultsScreen.tsx
src/components/results/ResultCard.tsx
src/components/results/SessionDropdown.tsx
src/components/results/ExamTypeFilterChips.tsx
src/components/results/ResultsSkeleton.tsx
src/utils/grade.ts
```

---

## 4. Grade Colour Utility

### `src/utils/grade.ts`

Matches the web ERP's `gradeClass()` utility exactly:

```ts
import type { BadgeVariant } from '../components/shared/AppBadge';

export function gradeVariant(grade: string): BadgeVariant {
  if (!grade) return 'muted';
  const g = grade.toUpperCase();
  if (g === 'A+' || g === 'A')           return 'success';
  if (g === 'B+' || g === 'B')           return 'info';
  if (g === 'C+' || g === 'C')           return 'warning';
  if (g === 'D')                         return 'default';
  if (g === 'F' || g === 'FAIL')         return 'destructive';
  return 'default';
}
```

---

## 5. Component Specifications

### `SessionDropdown.tsx`

**Props:**
```ts
interface SessionDropdownProps {
  selectedId:  string | null;
  onChange:    (sessionId: string) => void;
  branchId:    string;
}
```

**Behaviour:**
- Fetches sessions from `GET /api/sessions?branchId=<branchId>` using TanStack Query
- Renders a styled `Picker` or custom modal-based picker
- Default selection: the active session (`isActive: true`)
- Shows session name (e.g., "2024-25") in the dropdown
- On change: calls `onChange(sessionId)`

**Visual:**
- Looks like a flat card with session name + chevron-down icon
- Tapping opens a bottom sheet modal with a list of sessions
- Active session has a primary colour dot indicator

**Implementation note:** Use React Native `Modal` + `FlatList` for the bottom sheet picker (avoids native `Picker` styling inconsistencies). Or use `@gorhom/bottom-sheet` if available.

---

### `ExamTypeFilterChips.tsx`

**Props:**
```ts
interface ExamTypeFilterChipsProps {
  examTypes:        ExamType[];
  selectedExamTypeId: string | null; // null = "All"
  onChange:         (examTypeId: string | null) => void;
}
```

**Visual:**
- Horizontal scroll row of chips
- First chip: "All" (selected when `selectedExamTypeId === null`)
- One chip per exam type
- Selected chip: `bg-primary text-white`
- Unselected chip: `bg-surface-muted text-muted border border-border`
- Tap chip → calls `onChange(examType._id)` or `onChange(null)` for "All"

---

### `ResultCard.tsx`

**Props:**
```ts
interface ResultCardProps {
  result: ResultItem;
}
```

**Visual:**
```
┌────────────────────────────────────────────────────┐
│ Mathematics                      Mid Term          │
│ 15 Feb 2025                                        │
│                                                    │
│  42 / 50         84.0%    [A]    [PASSED]   #5     │
│ ────────────────────────────────────────────────── │
│ Progress bar (84% filled, primary colour)          │
└────────────────────────────────────────────────────┘
```

- Subject name: `text-base font-semibold text-foreground`
- Exam name + date: `text-xs text-muted`
- Marks: `text-sm font-medium text-foreground`
- Percentage: `text-sm text-muted`
- Grade badge: colour via `gradeVariant(result.grade)` — uses `AppBadge`
- Pass/Fail badge: `success` if passed, `destructive` if failed
- Rank: `#5` in `text-xs text-muted` (hidden if rank is null)
- Progress bar: thin bar below, filled % = `result.percentage`, colour = `bg-primary`

---

### `ResultsSkeleton.tsx`

Skeleton placeholders:
- Session dropdown block: width 200, height 44
- Filter chips row: 5 chips, height 36
- 4 result card placeholders: height 100 each

---

## 6. Results Screen

### `src/screens/results/ResultsScreen.tsx`

```tsx
import React, { useState } from 'react';
import { ScrollView, RefreshControl, View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient }               from '../../services/api-client';
import { useStudentStore, useBranchId, useSessionId } from '../../stores/student-store';
import { SessionDropdown }         from '../../components/results/SessionDropdown';
import { ExamTypeFilterChips }     from '../../components/results/ExamTypeFilterChips';
import { ResultCard }              from '../../components/results/ResultCard';
import { ResultsSkeleton }         from '../../components/results/ResultsSkeleton';
import { NoInternetBanner }        from '../../components/shared/NoInternetBanner';
import { AppEmptyState }           from '../../components/shared/AppEmptyState';
import type { ApiResponse, ResultsData } from '../../types/api';

async function fetchResults(sessionId: string, examTypeId: string | null): Promise<ResultsData> {
  const params = new URLSearchParams({ sessionId });
  if (examTypeId) params.set('examTypeId', examTypeId);
  const { data } = await apiClient.get<ApiResponse<ResultsData>>(
    `/api/portal/student/results?${params.toString()}`,
  );
  return data.data;
}

export function ResultsScreen() {
  const branchId       = useBranchId();
  const defaultSession = useSessionId();   // from StudentStore (active session)

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(defaultSession);
  const [selectedExamTypeId, setSelectedExamTypeId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['results', selectedSessionId, selectedExamTypeId],
    queryFn:  () => fetchResults(selectedSessionId!, selectedExamTypeId),
    enabled:  !!selectedSessionId,
  });

  if (!selectedSessionId) {
    return <AppEmptyState icon="alert-circle-outline" title="No session selected" description="Please select a session." />;
  }

  if (isLoading) return <ResultsSkeleton />;
  if (isError) {
    return (
      <AppEmptyState
        icon="alert-circle-outline"
        title="Could not load results"
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
        {/* Session dropdown */}
        <SessionDropdown
          selectedId={selectedSessionId}
          onChange={setSelectedSessionId}
          branchId={branchId ?? ''}
        />

        {/* Exam type filter chips */}
        {data && data.examTypes.length > 0 && (
          <View className="mt-3">
            <ExamTypeFilterChips
              examTypes={data.examTypes}
              selectedExamTypeId={selectedExamTypeId}
              onChange={setSelectedExamTypeId}
            />
          </View>
        )}

        {/* Result cards */}
        <View className="mt-4">
          {data?.results.length === 0 && (
            <AppEmptyState
              icon="chart-bar"
              title="No results found"
              description="No results available for the selected filters."
            />
          )}
          {data?.results.map((result) => (
            <View key={result._id} className="mb-3">
              <ResultCard result={result} />
            </View>
          ))}
        </View>

        {/* Spacer */}
        <View className="h-6" />
      </View>
    </ScrollView>
  );
}
```

---

## 7. Implementation Steps (in order)

1. Add result types to `src/types/models.ts`
2. Create `src/utils/grade.ts`
3. Build `ResultsSkeleton.tsx`
4. Build `SessionDropdown.tsx` (with bottom sheet modal picker)
5. Build `ExamTypeFilterChips.tsx`
6. Build `ResultCard.tsx` (with progress bar)
7. Build `ResultsScreen.tsx`
8. Replace stub screen

---

## 8. Verification Checklist

- [ ] Session dropdown shows all sessions for student's branch
- [ ] Active session is selected by default
- [ ] Selecting a different session reloads results
- [ ] "All" filter chip shows all results
- [ ] Selecting an exam type filter shows only those results
- [ ] Grade badge colours match web ERP (A+ = green, B = blue, C = amber, F = red)
- [ ] Pass/Fail badge shown correctly
- [ ] Rank shown when available, hidden when null
- [ ] Progress bar fills to correct percentage
- [ ] Empty state shown when no results for selection
- [ ] Pull-to-refresh works
- [ ] TypeScript: `npx tsc --noEmit` passes
