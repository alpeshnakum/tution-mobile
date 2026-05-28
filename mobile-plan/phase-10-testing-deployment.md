# Phase 10 — Notifications Screen

> **Goal:** Build the Notifications screen with infinite scroll pagination, mark-as-read on tap, mark-all-read button, and unread count badge on the drawer menu item. Also build the Notification Detail screen.
>
> **Depends on:** Phase 01 + 02 complete. `useStudentStore` must have `studentId` and `branchId` (populated by Phase 03).
>
> **No new backend APIs required.** Uses existing `/api/notifications`.

---

## 1. API Contracts

### `GET /api/notifications?recipientId=<studentId>&channel=in_app&page=1&limit=20`

**Query params:**
| Param | Required | Description |
|-------|----------|-------------|
| `recipientId` | Yes | Student's ID from `useStudentStore` |
| `channel` | Yes | Always `in_app` |
| `page` | No | Page number (default 1) |
| `limit` | No | Items per page (default 20) |

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id":       "notif1",
      "title":     "Exam Schedule Released",
      "body":      "The final exam timetable for 2024-25 has been published. Please check the timetable section.",
      "type":      "exam_notice",
      "isRead":    false,
      "createdAt": "2025-05-17T10:00:00.000Z"
    },
    {
      "_id":       "notif2",
      "title":     "Fee Reminder",
      "body":      "Quarter 2 fee is due on 31 July 2025.",
      "type":      "fee_reminder",
      "isRead":    true,
      "createdAt": "2025-05-15T09:00:00.000Z"
    }
  ],
  "meta": { "total": 15, "page": 1, "limit": 20, "totalPages": 1 },
  "error": null
}
```

**Notification type values:** `"fee_reminder"` | `"exam_notice"` | `"attendance_alert"` | `"result_published"` | `"announcement"` | `"promotion"`

---

### `PUT /api/notifications/:id/read` (mark single as read)

OR if the API marks as read via:
`PATCH /api/notifications/:id` with body `{ isRead: true }`

Check which format the existing API uses. Use the correct one.

**Response (200):**
```json
{ "success": true, "data": { "_id": "notif1", "isRead": true }, "error": null }
```

---

### `GET /api/notifications?recipientId=<id>&channel=in_app&isRead=false&limit=1`

Used only to get the unread count (or the API may return total from meta). Poll every 60 seconds while app is active.

**Alternative:** Use the meta total from the main notifications query if the API supports filtering by `isRead=false`.

---

## 2. TypeScript Types

Add to `src/types/models.ts`:

```ts
export type NotificationType =
  | 'fee_reminder'
  | 'exam_notice'
  | 'attendance_alert'
  | 'result_published'
  | 'announcement'
  | 'promotion';

export interface NotificationItem {
  _id:       string;
  title:     string;
  body:      string;
  type:      NotificationType;
  isRead:    boolean;
  createdAt: string;
}
```

---

## 3. New Files to Create

```
src/screens/notifications/NotificationsScreen.tsx
src/screens/notifications/NotificationDetailScreen.tsx
src/components/notifications/NotificationRow.tsx
src/components/notifications/NotificationsSkeleton.tsx
src/hooks/use-unread-count.ts
src/utils/notifications.ts
```

---

## 4. Notification Utilities

### `src/utils/notifications.ts`

```ts
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NotificationType } from '../types/models';

export const notificationTypeConfig: Record<NotificationType, { icon: string; label: string }> = {
  fee_reminder:      { icon: 'currency-inr',            label: 'Fee Reminder'      },
  exam_notice:       { icon: 'file-document-edit-outline',label: 'Exam Notice'      },
  attendance_alert:  { icon: 'calendar-alert',          label: 'Attendance Alert'  },
  result_published:  { icon: 'chart-bar',               label: 'Results Published' },
  announcement:      { icon: 'bullhorn-outline',         label: 'Announcement'      },
  promotion:         { icon: 'arrow-up-circle-outline',  label: 'Promotion'         },
};
```

---

## 5. Unread Count Hook

### `src/hooks/use-unread-count.ts`

Polls unread count every 60 seconds while app is in foreground. Updates a number that the drawer menu item uses to show a badge.

```ts
import { useQuery } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import { apiClient } from '../services/api-client';
import { useStudentId } from '../stores/student-store';
import type { ApiResponse, NotificationItem, PaginatedMeta } from '../types/api';

interface UnreadResponse {
  data:  NotificationItem[];
  meta:  PaginatedMeta;
}

export function useUnreadCount(): number {
  const studentId = useStudentId();
  const appState = useRef(AppState.currentState);

  const { data, refetch } = useQuery({
    queryKey: ['notifications-unread-count', studentId],
    queryFn:  async () => {
      if (!studentId) return 0;
      const { data: res } = await apiClient.get<{ success: boolean; data: NotificationItem[]; meta: PaginatedMeta }>(
        `/api/notifications?recipientId=${studentId}&channel=in_app&isRead=false&limit=1`,
      );
      return res.meta?.total ?? 0;
    },
    enabled:       !!studentId,
    refetchInterval: 60 * 1000,   // poll every 60 seconds
    refetchIntervalInBackground: false,
  });

  // Refetch when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        refetch();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refetch]);

  return data ?? 0;
}
```

**How to show badge in `DrawerContent.tsx`:**
In `DrawerContent.tsx` (built in Phase 02), add:
```tsx
const unreadCount = useUnreadCount();
// In the Notifications menu item, show a red badge dot:
// <View className="w-2 h-2 rounded-full bg-destructive absolute top-1 right-1" />
// Or pass to a custom drawer item renderer
```

Use `DrawerItem` from `@react-navigation/drawer` with a custom `right` prop to render the badge.

---

## 6. Component Specifications

### `NotificationRow.tsx`

**Props:**
```ts
interface NotificationRowProps {
  notification: NotificationItem;
  onPress:      () => void;
}
```

**Visual:**
```
┌───���──────────────────────────────────────────────────┐
│ [icon]  Exam Schedule Released          12 min ago   │
│         The final exam timetable for...    ● (unread)│
└──────────────────────────────────────────────────────┘
```

- Left: type icon in a tinted circle (`bg-info/10` or relevant type colour)
- Title: `text-sm font-semibold` if unread, `font-normal` if read
- Body preview: 1 line truncated, `text-xs text-muted`
- Time: relative format (e.g., "12 min ago", "2 hours ago", "3 days ago") — use `formatRelativeTime()` from Phase 01
- Blue dot: `w-2 h-2 bg-primary rounded-full` — shown only if `!notification.isRead`
- Background: `bg-primary/5` if unread, `bg-background` if read
- Row is touchable → calls `onPress()`

---

### `NotificationsSkeleton.tsx`

Skeleton placeholders:
- 8 row placeholders: each has an icon circle (left), two line blocks (right), height ~64 each

---

## 7. Notifications Screen

### `src/screens/notifications/NotificationsScreen.tsx`

Uses infinite scroll with TanStack Query's `useInfiniteQuery`.

```tsx
import React, { useCallback } from 'react';
import {
  FlatList, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient }               from '../../services/api-client';
import { useStudentId }            from '../../stores/student-store';
import { NotificationRow }         from '../../components/notifications/NotificationRow';
import { NotificationsSkeleton }   from '../../components/notifications/NotificationsSkeleton';
import { NoInternetBanner }        from '../../components/shared/NoInternetBanner';
import { AppEmptyState }           from '../../components/shared/AppEmptyState';
import { toast }                   from '../../utils/toast';
import type { ApiResponse, NotificationItem, PaginatedMeta } from '../../types/api';
import type { NotificationsStackParamList } from '../../types/navigation';

type Props = { navigation: StackNavigationProp<NotificationsStackParamList, 'Notifications'> };

const LIMIT = 20;

interface NotificationsPage {
  data: NotificationItem[];
  meta: PaginatedMeta;
}

async function fetchNotifications(studentId: string, page: number): Promise<NotificationsPage> {
  const { data: res } = await apiClient.get<{ success: boolean; data: NotificationItem[]; meta: PaginatedMeta }>(
    `/api/notifications?recipientId=${studentId}&channel=in_app&page=${page}&limit=${LIMIT}`,
  );
  return { data: res.data, meta: res.meta! };
}

export function NotificationsScreen({ navigation }: Props) {
  const studentId  = useStudentId();
  const queryClient = useQueryClient();

  const {
    data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage,
    refetch, isRefetching,
  } = useInfiniteQuery({
    queryKey:          ['notifications', studentId],
    queryFn:           ({ pageParam = 1 }) => fetchNotifications(studentId!, pageParam as number),
    initialPageParam:  1,
    getNextPageParam:  (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    enabled: !!studentId,
  });

  const allNotifications = data?.pages.flatMap((p) => p.data) ?? [];

  // Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: (notifId: string) =>
      apiClient.patch(`/api/notifications/${notifId}`, { isRead: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/notifications/mark-all-read`, { recipientId: studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast.success('All notifications marked as read.');
    },
    onError: () => toast.error('Failed to mark all as read.'),
  });

  const handlePress = useCallback((notification: NotificationItem) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }
    navigation.navigate('NotificationDetail', { notificationId: notification._id });
  }, [markReadMutation, navigation]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <NotificationsSkeleton />;
  if (isError) {
    return (
      <AppEmptyState
        icon="alert-circle-outline"
        title="Could not load notifications"
        ctaLabel="Retry"
        onCta={() => refetch()}
      />
    );
  }

  const hasUnread = allNotifications.some((n) => !n.isRead);

  return (
    <View className="flex-1 bg-background">
      <NoInternetBanner />

      {/* Mark all read header button */}
      {hasUnread && (
        <View className="px-4 py-2 border-b border-border flex-row justify-end">
          <TouchableOpacity onPress={() => markAllReadMutation.mutate()}>
            <Text className="text-sm text-primary font-medium">Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={allNotifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationRow notification={item} onPress={() => handlePress(item)} />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#CC785C" />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#CC785C" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <AppEmptyState
            icon="bell-off-outline"
            title="No notifications"
            description="You have no notifications yet."
          />
        }
        ItemSeparatorComponent={() => <View className="h-px bg-border mx-4" />}
      />
    </View>
  );
}
```

---

## 8. Notification Detail Screen

### `src/screens/notifications/NotificationDetailScreen.tsx`

**Route params:** `{ notificationId: string }`

**Behaviour:**
- Finds notification from cached data (no extra API call)
- Displays full title + body + type + date

```tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppLoader }     from '../../components/shared/AppLoader';
import { AppEmptyState } from '../../components/shared/AppEmptyState';
import { notificationTypeConfig } from '../../utils/notifications';
import { formatDateTime } from '../../utils/format';
import { useStudentId }  from '../../stores/student-store';
import { apiClient }     from '../../services/api-client';
import type { NotificationsStackParamList } from '../../types/navigation';
import type { NotificationItem, PaginatedMeta } from '../../types/models';

type Props = { route: RouteProp<NotificationsStackParamList, 'NotificationDetail'> };

export function NotificationDetailScreen({ route }: Props) {
  const { notificationId } = route.params;
  const studentId = useStudentId();

  // Pull from cache — notifications already fetched by NotificationsScreen
  const { data: allPages, isLoading } = useQuery({
    queryKey: ['notifications', studentId],
    queryFn: async () => {
      const { data: res } = await apiClient.get<{ success: boolean; data: NotificationItem[]; meta: PaginatedMeta }>(
        `/api/notifications?recipientId=${studentId}&channel=in_app&page=1&limit=20`,
      );
      return { pages: [{ data: res.data, meta: res.meta }] };
    },
    enabled: !!studentId,
  });

  const notification = (allPages as any)?.pages
    ?.flatMap((p: any) => p.data as NotificationItem[])
    ?.find((n: NotificationItem) => n._id === notificationId);

  if (isLoading) return <AppLoader fullScreen />;
  if (!notification) return <AppEmptyState icon="bell-off-outline" title="Notification not found" />;

  const { icon, label } = notificationTypeConfig[notification.type] ?? { icon: 'bell', label: 'Notification' };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-5">
        {/* Type icon + label */}
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full bg-info/10 items-center justify-center mr-3">
            <MaterialCommunityIcons name={icon as any} size={20} color="#6B8CAE" />
          </View>
          <Text className="text-xs text-muted font-medium uppercase tracking-wide">{label}</Text>
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-foreground mb-2">{notification.title}</Text>

        {/* Date */}
        <Text className="text-xs text-muted mb-5">{formatDateTime(notification.createdAt)}</Text>

        {/* Body */}
        <Text className="text-base text-foreground leading-relaxed">{notification.body}</Text>
      </View>
    </ScrollView>
  );
}
```

---

## 9. Unread Badge in DrawerContent

Update `src/navigation/DrawerContent.tsx` (built in Phase 02) to show unread notification count:

```tsx
// Add to DrawerContent.tsx:
import { useUnreadCount } from '../hooks/use-unread-count';

// Inside DrawerContent component:
const unreadCount = useUnreadCount();

// Use it in the custom drawer items list to show a red badge number
// next to "Notifications" menu item:
// <Text className="text-xs bg-destructive text-white rounded-full px-1.5 py-0.5">
//   {unreadCount}
// </Text>
```

Since `DrawerItemList` from React Navigation renders items automatically, override the "NotificationsStack" drawer item with a custom `DrawerItem` that has a badge:

```tsx
// In StudentDrawer.tsx screenOptions or in DrawerContent:
// Use DrawerItem for Notifications with a custom right element:
<DrawerItem
  label="Notifications"
  icon={({ color }) => <Icon name="bell-outline" color={color} />}
  onPress={() => props.navigation.navigate('NotificationsStack')}
  right={() =>
    unreadCount > 0 ? (
      <View className="bg-destructive rounded-full px-1.5 py-0.5 min-w-5 items-center">
        <Text className="text-xs text-white font-bold">{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
      </View>
    ) : null
  }
/>
```

---

## 10. Implementation Steps (in order)

1. Add notification types to `src/types/models.ts`
2. Create `src/utils/notifications.ts`
3. Build `NotificationsSkeleton.tsx`
4. Build `NotificationRow.tsx`
5. Build `src/hooks/use-unread-count.ts`
6. Build `NotificationsScreen.tsx`
7. Build `NotificationDetailScreen.tsx`
8. Update `DrawerContent.tsx` to show unread badge on Notifications menu item
9. Replace stub screens

---

## 11. Verification Checklist

- [ ] Notifications screen loads with paginated data
- [ ] Unread notifications have blue dot + bold title + primary/5 background
- [ ] Read notifications have normal weight title + transparent background
- [ ] Tapping a notification marks it read and navigates to detail
- [ ] Notification detail shows full body, type, and formatted date/time
- [ ] "Mark all as read" button appears when there are unread notifications
- [ ] Mark all read clears unread styling on all visible items
- [ ] Scroll to bottom triggers loading of next page (infinite scroll)
- [ ] Unread count badge on drawer menu updates within 60 seconds
- [ ] Unread badge disappears when count reaches 0
- [ ] Pull-to-refresh reloads first page
- [ ] Empty state shown when no notifications
- [ ] TypeScript: `npx tsc --noEmit` passes
