# Phase 07 — Homework Screens

> **Goal:** Build the Homework list screen (with subject filter and Today/Upcoming/Past grouping) and the Homework Detail screen (full description + attachments).
>
> **Depends on:** Phase 01 + 02 complete. `useStudentStore` must have `classId` (populated by Phase 03).
>
> **No new backend APIs required.** Uses existing `GET /api/homework/class/:classId`.

---

## 1. API Contract

### `GET /api/homework/class/:classId`

**Path param:** `classId` from `useStudentStore`

**Query params (optional):**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter: `all` \| `pending` \| `submitted` (default: `all`) |
| `subjectId` | string | Filter by subject |

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id":         "hw1",
      "title":       "Solve Quadratic Equations",
      "description": "Complete exercises 3.1 to 3.5 from the textbook. Show all working.",
      "dueDate":     "2025-05-20T00:00:00.000Z",
      "assignedDate":"2025-05-17T00:00:00.000Z",
      "status":      "pending",
      "subject": {
        "_id":  "sub1",
        "name": "Mathematics"
      },
      "teacher": {
        "_id":  "tch1",
        "name": "Mr. Sharma"
      },
      "attachments": [
        {
          "name": "exercise_sheet.pdf",
          "url":  "https://your-erp-domain.com/uploads/hw/exercise_sheet.pdf"
        }
      ]
    }
  ],
  "error": null
}
```

**Homework status values:** `"pending"` | `"submitted"` | `"overdue"`

---

## 2. TypeScript Types

Add to `src/types/models.ts`:

```ts
export type HomeworkStatus = 'pending' | 'submitted' | 'overdue';

export interface HomeworkAttachment {
  name: string;
  url:  string;
}

export interface HomeworkItem {
  _id:          string;
  title:        string;
  description:  string;
  dueDate:      string;
  assignedDate: string;
  status:       HomeworkStatus;
  subject: {
    _id:  string;
    name: string;
  };
  teacher: {
    _id:  string;
    name: string;
  };
  attachments: HomeworkAttachment[];
}
```

---

## 3. New Files to Create

```
src/screens/homework/HomeworkScreen.tsx
src/screens/homework/HomeworkDetailScreen.tsx
src/components/homework/HomeworkCard.tsx
src/components/homework/SubjectFilterChips.tsx
src/components/homework/HomeworkSkeleton.tsx
src/utils/homework.ts
```

---

## 4. Homework Group Logic

### `src/utils/homework.ts`

Group homework into Today / Upcoming / Past based on `dueDate`:

```ts
import { isToday, isFuture, isPast, parseISO } from 'date-fns';
import type { HomeworkItem } from '../types/models';

export type HomeworkGroup = 'Today' | 'Upcoming' | 'Past';

export interface GroupedHomework {
  Today:    HomeworkItem[];
  Upcoming: HomeworkItem[];
  Past:     HomeworkItem[];
}

export function groupHomework(items: HomeworkItem[]): GroupedHomework {
  const groups: GroupedHomework = { Today: [], Upcoming: [], Past: [] };
  for (const item of items) {
    const due = parseISO(item.dueDate);
    if (isToday(due))        groups.Today.push(item);
    else if (isFuture(due))  groups.Upcoming.push(item);
    else                     groups.Past.push(item);
  }
  return groups;
}

export function homeworkStatusConfig(status: HomeworkStatus): { variant: BadgeVariant; label: string } {
  switch (status) {
    case 'submitted': return { variant: 'success',     label: 'Submitted' };
    case 'overdue':   return { variant: 'destructive', label: 'Overdue'   };
    default:          return { variant: 'warning',     label: 'Pending'   };
  }
}
```

---

## 5. Component Specifications

### `SubjectFilterChips.tsx`

**Props:**
```ts
interface SubjectFilterChipsProps {
  subjects:         Array<{ _id: string; name: string }>;
  selectedSubjectId:string | null; // null = "All"
  onChange:         (subjectId: string | null) => void;
}
```

**Visual:**
- Same style as `ExamTypeFilterChips` from Phase 06
- Horizontal scroll row: "All" chip + one chip per subject
- Selected chip: `bg-primary text-white`
- Unselected chip: `bg-surface-muted text-muted border border-border`

---

### `HomeworkCard.tsx`

**Props:**
```ts
interface HomeworkCardProps {
  item:    HomeworkItem;
  onPress: () => void;
}
```

**Visual:**
```
┌────────────────────────────────────────┐
│ [Mathematics]    [PENDING]             │
│ Solve Quadratic Equations              │
│ Teacher: Mr. Sharma                    │
│ Due: 20 May 2025  📎 1 attachment      │
└────────────────────────────────────────┘
```

- Subject name: `AppBadge` with `variant="info"` style (or subject-specific colour)
- Status badge: colour from `homeworkStatusConfig(item.status).variant`
- Title: `text-base font-medium text-foreground`
- Teacher name: `text-xs text-muted`
- Due date: `text-xs text-muted`. If `isToday(parseISO(item.dueDate))`: show "Due Today" in warning colour
- Attachment count: paperclip icon + count (hidden if 0)
- Entire card is touchable → calls `onPress`

---

### `HomeworkSkeleton.tsx`

Skeleton placeholders:
- Filter chips: 5 chips row, height 36
- Section header: width 80, height 20
- 3 card placeholders: height 90 each

---

## 6. Homework List Screen

### `src/screens/homework/HomeworkScreen.tsx`

```tsx
import React, { useState, useMemo } from 'react';
import { ScrollView, RefreshControl, View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient }               from '../../services/api-client';
import { useClassId }              from '../../stores/student-store';
import { SubjectFilterChips }      from '../../components/homework/SubjectFilterChips';
import { HomeworkCard }            from '../../components/homework/HomeworkCard';
import { HomeworkSkeleton }        from '../../components/homework/HomeworkSkeleton';
import { NoInternetBanner }        from '../../components/shared/NoInternetBanner';
import { AppEmptyState }           from '../../components/shared/AppEmptyState';
import { groupHomework }           from '../../utils/homework';
import type { ApiResponse, HomeworkItem } from '../../types/api';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { HomeworkStackParamList } from '../../types/navigation';

type Props = { navigation: StackNavigationProp<HomeworkStackParamList, 'Homework'> };

async function fetchHomework(classId: string): Promise<HomeworkItem[]> {
  const { data } = await apiClient.get<ApiResponse<HomeworkItem[]>>(
    `/api/homework/class/${classId}`,
  );
  return data.data;
}

export function HomeworkScreen({ navigation }: Props) {
  const classId = useClassId();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['homework', classId],
    queryFn:  () => fetchHomework(classId!),
    enabled:  !!classId,
  });

  // Extract unique subjects from all homework items
  const subjects = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, string>();
    data.forEach((hw) => map.set(hw.subject._id, hw.subject.name));
    return Array.from(map.entries()).map(([_id, name]) => ({ _id, name }));
  }, [data]);

  // Filter by selected subject
  const filtered = useMemo(() => {
    if (!data) return [];
    if (!selectedSubjectId) return data;
    return data.filter((hw) => hw.subject._id === selectedSubjectId);
  }, [data, selectedSubjectId]);

  const grouped = useMemo(() => groupHomework(filtered), [filtered]);

  if (isLoading) return <HomeworkSkeleton />;
  if (isError) {
    return (
      <AppEmptyState
        icon="alert-circle-outline"
        title="Could not load homework"
        ctaLabel="Retry"
        onCta={() => refetch()}
      />
    );
  }

  const hasAny = filtered.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#CC785C" />}
    >
      <NoInternetBanner />
      <View className="px-4 pt-4">
        {/* Subject filter */}
        <SubjectFilterChips
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onChange={setSelectedSubjectId}
        />

        {!hasAny && (
          <AppEmptyState
            icon="book-open-outline"
            title="No homework found"
            description={selectedSubjectId ? 'No homework for this subject.' : 'No homework assigned yet.'}
          />
        )}

        {/* Today group */}
        {grouped.Today.length > 0 && (
          <View className="mt-4">
            <Text className="text-sm font-semibold text-destructive mb-2">Due Today</Text>
            {grouped.Today.map((hw) => (
              <View key={hw._id} className="mb-3">
                <HomeworkCard
                  item={hw}
                  onPress={() => navigation.navigate('HomeworkDetail', { homeworkId: hw._id })}
                />
              </View>
            ))}
          </View>
        )}

        {/* Upcoming group */}
        {grouped.Upcoming.length > 0 && (
          <View className="mt-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Upcoming</Text>
            {grouped.Upcoming.map((hw) => (
              <View key={hw._id} className="mb-3">
                <HomeworkCard
                  item={hw}
                  onPress={() => navigation.navigate('HomeworkDetail', { homeworkId: hw._id })}
                />
              </View>
            ))}
          </View>
        )}

        {/* Past group */}
        {grouped.Past.length > 0 && (
          <View className="mt-4">
            <Text className="text-sm font-semibold text-muted mb-2">Past</Text>
            {grouped.Past.map((hw) => (
              <View key={hw._id} className="mb-3">
                <HomeworkCard
                  item={hw}
                  onPress={() => navigation.navigate('HomeworkDetail', { homeworkId: hw._id })}
                />
              </View>
            ))}
          </View>
        )}

        <View className="h-6" />
      </View>
    </ScrollView>
  );
}
```

---

## 7. Homework Detail Screen

### `src/screens/homework/HomeworkDetailScreen.tsx`

**Route params:** `{ homeworkId: string }`

**Behaviour:**
- Finds the homework item from React Query cache (no additional API call needed — data is already cached from HomeworkScreen)
- If not in cache, re-fetches `/api/homework/class/:classId`
- Displays full description and attachments list (view-only, opens URL in device browser)

```tsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons }  from '@expo/vector-icons';
import { useClassId }              from '../../stores/student-store';
import { AppCard }                 from '../../components/shared/AppCard';
import { AppBadge }                from '../../components/shared/AppBadge';
import { AppLoader }               from '../../components/shared/AppLoader';
import { AppEmptyState }           from '../../components/shared/AppEmptyState';
import { homeworkStatusConfig }    from '../../utils/homework';
import { formatDate }              from '../../utils/format';
import { apiClient }               from '../../services/api-client';
import type { HomeworkStackParamList } from '../../types/navigation';
import type { ApiResponse, HomeworkItem } from '../../types/api';

type Props = { route: RouteProp<HomeworkStackParamList, 'HomeworkDetail'> };

export function HomeworkDetailScreen({ route }: Props) {
  const { homeworkId } = route.params;
  const classId = useClassId();

  // Read from cache if available, otherwise fetch
  const { data: allHomework, isLoading } = useQuery({
    queryKey: ['homework', classId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<HomeworkItem[]>>(`/api/homework/class/${classId}`);
      return data.data;
    },
    enabled: !!classId,
  });

  const homework = allHomework?.find((hw) => hw._id === homeworkId);

  if (isLoading) return <AppLoader fullScreen />;
  if (!homework) return <AppEmptyState icon="book-off-outline" title="Homework not found" />;

  const { variant, label } = homeworkStatusConfig(homework.status);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-4">
        {/* Header info */}
        <View className="flex-row items-center justify-between mb-4">
          <AppBadge variant="info">{homework.subject.name}</AppBadge>
          <AppBadge variant={variant}>{label}</AppBadge>
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-foreground mb-2">{homework.title}</Text>

        {/* Meta */}
        <View className="flex-row items-center mb-1">
          <MaterialCommunityIcons name="account-tie-outline" size={14} color="#6B6862" />
          <Text className="text-xs text-muted ml-1">Teacher: {homework.teacher.name}</Text>
        </View>
        <View className="flex-row items-center mb-1">
          <MaterialCommunityIcons name="calendar-plus" size={14} color="#6B6862" />
          <Text className="text-xs text-muted ml-1">Assigned: {formatDate(homework.assignedDate)}</Text>
        </View>
        <View className="flex-row items-center mb-4">
          <MaterialCommunityIcons name="calendar-clock" size={14} color="#6B6862" />
          <Text className="text-xs text-muted ml-1">Due: {formatDate(homework.dueDate)}</Text>
        </View>

        {/* Description */}
        <AppCard className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">Description</Text>
          <Text className="text-sm text-foreground leading-relaxed">{homework.description}</Text>
        </AppCard>

        {/* Attachments */}
        {homework.attachments.length > 0 && (
          <AppCard>
            <Text className="text-sm font-semibold text-foreground mb-2">Attachments</Text>
            {homework.attachments.map((att, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => Linking.openURL(att.url)}
                className="flex-row items-center py-2 border-b border-border last:border-b-0"
              >
                <MaterialCommunityIcons name="file-outline" size={18} color="#CC785C" />
                <Text className="text-sm text-primary ml-2 flex-1" numberOfLines={1}>{att.name}</Text>
                <MaterialCommunityIcons name="open-in-new" size={16} color="#6B6862" />
              </TouchableOpacity>
            ))}
          </AppCard>
        )}

        <View className="h-6" />
      </View>
    </ScrollView>
  );
}
```

---

## 8. Implementation Steps (in order)

1. Add homework types to `src/types/models.ts`
2. Create `src/utils/homework.ts` with `groupHomework` and `homeworkStatusConfig`
3. Build `HomeworkSkeleton.tsx`
4. Build `SubjectFilterChips.tsx`
5. Build `HomeworkCard.tsx`
6. Build `HomeworkScreen.tsx`
7. Build `HomeworkDetailScreen.tsx`
8. Replace stub screens

---

## 9. Verification Checklist

- [ ] Homework screen loads real data from API
- [ ] Subject filter chips extract unique subjects from homework data
- [ ] Selecting a subject filter shows only that subject's homework
- [ ] "All" chip shows all homework
- [ ] Homework is grouped into Today / Upcoming / Past sections
- [ ] "Due Today" header is red; "Upcoming" is normal; "Past" is muted
- [ ] Overdue status shows red badge; submitted shows green; pending shows amber
- [ ] Tapping a card navigates to HomeworkDetailScreen
- [ ] Detail screen shows full description, teacher, assigned date, due date
- [ ] Attachment list shown; tapping opens URL in browser via `Linking.openURL`
- [ ] Pull-to-refresh on list screen reloads data
- [ ] Empty state shown when no homework
- [ ] TypeScript: `npx tsc --noEmit` passes
