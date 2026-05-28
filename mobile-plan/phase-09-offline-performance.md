# Phase 09 — Leave Requests Screens

> **Goal:** Build the Leave Requests screen (list with status filter) and the Leave Apply screen (form to submit a new leave application). Also build the required new backend API endpoints in the ERP web app.
>
> **Depends on:** Phase 01 + 02 complete. `useStudentStore` must have `studentId`, `sessionId`, `branchId` (populated by Phase 03).
>
> **Requires new backend APIs** — build these in the ERP web app BEFORE building the mobile screens.

---

## 1. New Backend APIs (Build in ERP Web App First)

### 1a. Extend the Leave Model (`lib/models/Leave.ts`)

Add the following fields to the existing Leave Mongoose schema:

```ts
// Add to existing Leave schema:
applicantRole: {
  type:    String,
  enum:    ['student', 'teacher'],
  default: 'teacher',  // backwards compatible — existing leaves remain teacher
},
studentId: {
  type:     String,
  default:  null,  // null for teacher leaves, populated for student leaves
},
```

Add compound index:
```ts
LeaveSchema.index({ studentId: 1, branchId: 1, status: 1 });
```

Make `teacherId` optional (if not already) since student leaves won't have a teacherId:
```ts
teacherId: { type: String, required: false, default: null }
```

Update the Leave Zod validation schema in `lib/validations/leave.ts` to make `teacherId` optional and add `applicantRole` + `studentId`.

---

### 1b. `GET /api/portal/student/leaves`

**File:** `app/api/portal/student/leaves/route.ts`

**Purpose:** List the authenticated student's own leave applications.

**Auth:** JWT with `role === 'student'`. `studentId` extracted from JWT payload — not from query params.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | `all` | Filter: `all` \| `pending` \| `approved` \| `rejected` \| `cancelled` |
| `page` | number | 1 | Pagination |
| `limit` | number | 20 | Page size |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id":         "leave1",
      "fromDate":    "2025-05-20T00:00:00.000Z",
      "toDate":      "2025-05-21T00:00:00.000Z",
      "days":        2,
      "leaveType":   "sick",
      "reason":      "Fever and cold",
      "status":      "pending",
      "appliedDate": "2025-05-17T00:00:00.000Z",
      "remarks":     null
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 },
  "error": null
}
```

**Implementation:**
```ts
// app/api/portal/student/leaves/route.ts
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAuthUser }       from '@/lib/auth-helpers';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { parsePaginationParams, paginatedQuery } from '@/lib/api-helpers';
import Leave from '@/lib/models/Leave';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const user = await getAuthUser(req);
  if (!user) return apiError('Unauthorised', 401);
  if (user.role !== 'student') return apiError('Forbidden', 403);
  if (!user.studentId) return apiError('Student ID not found', 400);

  const { page, limit } = parsePaginationParams(req);
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  const query: Record<string, unknown> = {
    studentId:      user.studentId,
    branchId:       user.branchId,
    applicantRole:  'student',
    isActive:       true,
  };
  if (statusFilter && statusFilter !== 'all') {
    query.status = statusFilter;
  }

  const result = await paginatedQuery(Leave, query, { page, limit, sort: { createdAt: -1 } });
  return apiSuccess(result.data, result.meta);
}
```

---

### 1c. `POST /api/portal/student/leaves`

**File:** `app/api/portal/student/leaves/route.ts` (same file, add POST handler)

**Purpose:** Submit a new leave application. `studentId` is taken from the JWT — not from the request body.

**Request body:**
```json
{
  "fromDate":  "2025-05-20",
  "toDate":    "2025-05-21",
  "leaveType": "sick",
  "reason":    "Fever and cold"
}
```

**Leave type enum:** `"sick"` | `"personal"` | `"family"` | `"other"`

**Validation rules:**
- `fromDate` must not be in the past (compare date only, not time)
- `toDate` must be >= `fromDate`
- `reason` must be at least 10 characters
- `leaveType` must be one of the enum values

**Response (201):**
```json
{
  "success": true,
  "data": { "_id": "leave_new", "status": "pending", ...fields },
  "error": null
}
```

**Response (400 — date in past):**
```json
{ "success": false, "data": null, "error": "Leave cannot be applied for past dates." }
```

**Implementation:**
```ts
export async function POST(req: NextRequest) {
  await connectToDatabase();
  const user = await getAuthUser(req);
  if (!user) return apiError('Unauthorised', 401);
  if (user.role !== 'student') return apiError('Forbidden', 403);
  if (!user.studentId) return apiError('Student ID not found', 400);

  const body = await req.json();
  const parsed = studentLeaveSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

  const { fromDate, toDate, leaveType, reason } = parsed.data;

  // Validate dates
  const today = new Date(); today.setHours(0,0,0,0);
  const from  = new Date(fromDate); from.setHours(0,0,0,0);
  if (from < today) return apiError('Leave cannot be applied for past dates.', 400);
  if (new Date(toDate) < new Date(fromDate)) return apiError('To date must be on or after from date.', 400);

  // Calculate number of days
  const days = Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000) + 1;

  const leave = await Leave.create({
    studentId:     user.studentId,
    branchId:      user.branchId,
    applicantRole: 'student',
    fromDate,
    toDate,
    days,
    leaveType,
    reason,
    status:        'pending',
    appliedDate:   new Date(),
  });

  await logActivity({ userId: user.userId, action: 'create', entity: 'leave', entityId: leave._id.toString(), branchId: user.branchId });

  return NextResponse.json({ success: true, data: leave, error: null }, { status: 201 });
}
```

**Zod validation schema for POST (`lib/validations/leave.ts` — add):**
```ts
export const studentLeaveSchema = z.object({
  fromDate:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  toDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  leaveType: z.enum(['sick', 'personal', 'family', 'other']),
  reason:    z.string().min(10, 'Reason must be at least 10 characters'),
});
```

---

### 1d. `DELETE /api/portal/student/leaves/:id`

**File:** `app/api/portal/student/leaves/[id]/route.ts`

**Purpose:** Soft-cancel a pending leave (set `status = 'cancelled'`). Only allowed if current status is `pending`.

**Response (200):**
```json
{ "success": true, "data": { "message": "Leave cancelled." }, "error": null }
```

**Response (400 — not pending):**
```json
{ "success": false, "data": null, "error": "Only pending leaves can be cancelled." }
```

**Response (403 — not owner):**
```json
{ "success": false, "data": null, "error": "You can only cancel your own leave requests." }
```

**Implementation:**
```ts
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const user = await getAuthUser(req);
  if (!user) return apiError('Unauthorised', 401);
  if (user.role !== 'student') return apiError('Forbidden', 403);

  const leave = await Leave.findById(params.id).lean();
  if (!leave || !leave.isActive) return apiError('Leave not found', 404);
  if (leave.studentId !== user.studentId) return apiError('You can only cancel your own leave requests.', 403);
  if (leave.status !== 'pending') return apiError('Only pending leaves can be cancelled.', 400);

  await Leave.findByIdAndUpdate(params.id, { status: 'cancelled' });
  await logActivity({ userId: user.userId, action: 'update', entity: 'leave', entityId: params.id, branchId: user.branchId });

  return apiSuccess({ message: 'Leave cancelled.' });
}
```

---

## 2. TypeScript Types

Add to `src/types/models.ts`:

```ts
export type LeaveStatus   = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveType     = 'sick' | 'personal' | 'family' | 'other';

export interface LeaveItem {
  _id:         string;
  fromDate:    string;
  toDate:      string;
  days:        number;
  leaveType:   LeaveType;
  reason:      string;
  status:      LeaveStatus;
  appliedDate: string;
  remarks:     string | null;
}
```

---

## 3. New Files to Create

```
src/screens/leaves/LeaveRequestsScreen.tsx
src/screens/leaves/LeaveApplyScreen.tsx
src/components/leaves/LeaveCard.tsx
src/components/leaves/LeaveStatusFilter.tsx
src/components/leaves/LeavesSkeleton.tsx
src/utils/leaves.ts
```

---

## 4. Leave Utilities

### `src/utils/leaves.ts`

```ts
import type { LeaveStatus, LeaveType } from '../types/models';
import type { BadgeVariant } from '../components/shared/AppBadge';

export const leaveStatusConfig: Record<LeaveStatus, { variant: BadgeVariant; label: string }> = {
  pending:   { variant: 'warning',     label: 'Pending'   },
  approved:  { variant: 'success',     label: 'Approved'  },
  rejected:  { variant: 'destructive', label: 'Rejected'  },
  cancelled: { variant: 'muted',       label: 'Cancelled' },
};

export const leaveTypeLabels: Record<LeaveType, string> = {
  sick:     'Sick Leave',
  personal: 'Personal Leave',
  family:   'Family Leave',
  other:    'Other',
};
```

---

## 5. Component Specifications

### `LeaveStatusFilter.tsx`

**Props:**
```ts
interface LeaveStatusFilterProps {
  selected: LeaveStatus | 'all';
  onChange: (status: LeaveStatus | 'all') => void;
}
```

**Visual:**
- Horizontal scroll row of tab chips: All | Pending | Approved | Rejected | Cancelled
- Same style as `ExamTypeFilterChips` from Phase 06
- Selected chip uses the status colour (pending=warning, approved=success, etc.)

---

### `LeaveCard.tsx`

**Props:**
```ts
interface LeaveCardProps {
  leave:    LeaveItem;
  onCancel?: () => void;  // shown only if status === 'pending'
}
```

**Visual:**
```
┌─────────────────────────────────────────────────┐
│ 20 May – 21 May 2025 (2 days)    [PENDING]      │
│ Sick Leave                                      │
│ "Fever and cold"                                │
│ Applied: 17 May 2025                            │
│                              [Cancel Request]   │
└─────────────────────────────────────────────────┘
```

- Date range: `text-sm font-medium text-foreground` + days count badge
- Status badge: colour from `leaveStatusConfig`
- Leave type: `text-xs text-muted`
- Reason: `text-sm text-foreground` (truncated to 2 lines with `numberOfLines={2}`)
- Applied date: `text-xs text-muted`
- Cancel button: only shown when `status === 'pending'`. Destructive outline style. Tapping calls `onCancel()`

---

### `LeavesSkeleton.tsx`

Skeleton placeholders:
- Filter tabs row: height 36
- 3 leave card placeholders: height 100 each

---

## 6. Leave Requests Screen

### `src/screens/leaves/LeaveRequestsScreen.tsx`

```tsx
import React, { useState } from 'react';
import { ScrollView, RefreshControl, View, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons }  from '@expo/vector-icons';
import { apiClient }               from '../../services/api-client';
import { LeaveCard }               from '../../components/leaves/LeaveCard';
import { LeaveStatusFilter }       from '../../components/leaves/LeaveStatusFilter';
import { LeavesSkeleton }          from '../../components/leaves/LeavesSkeleton';
import { NoInternetBanner }        from '../../components/shared/NoInternetBanner';
import { AppEmptyState }           from '../../components/shared/AppEmptyState';
import { toast }                   from '../../utils/toast';
import type { ApiResponse, LeaveItem, LeaveStatus } from '../../types/api';
import type { LeavesStackParamList } from '../../types/navigation';

type Props = { navigation: StackNavigationProp<LeavesStackParamList, 'LeaveRequests'> };

async function fetchLeaves(status: string): Promise<LeaveItem[]> {
  const { data } = await apiClient.get<ApiResponse<LeaveItem[]>>(
    `/api/portal/student/leaves?status=${status}`,
  );
  return data.data;
}

export function LeaveRequestsScreen({ navigation }: Props) {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('all');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['leaves', statusFilter],
    queryFn:  () => fetchLeaves(statusFilter),
  });

  const cancelMutation = useMutation({
    mutationFn: (leaveId: string) => apiClient.delete(`/api/portal/student/leaves/${leaveId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave request cancelled.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? 'Failed to cancel leave.';
      toast.error(msg);
    },
  });

  const confirmCancel = (leaveId: string) => {
    Alert.alert(
      'Cancel Leave',
      'Are you sure you want to cancel this leave request?',
      [
        { text: 'No',  style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => cancelMutation.mutate(leaveId) },
      ],
    );
  };

  if (isLoading) return <LeavesSkeleton />;
  if (isError) {
    return (
      <AppEmptyState
        icon="alert-circle-outline"
        title="Could not load leave requests"
        ctaLabel="Retry"
        onCta={() => refetch()}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <NoInternetBanner />

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#CC785C" />}
      >
        <View className="px-4 pt-4">
          {/* Status filter */}
          <LeaveStatusFilter selected={statusFilter} onChange={setStatusFilter} />

          {/* Leave cards */}
          <View className="mt-4">
            {data?.length === 0 && (
              <AppEmptyState
                icon="calendar-remove-outline"
                title="No leave requests"
                description="You haven't applied for any leave yet."
              />
            )}
            {data?.map((leave) => (
              <View key={leave._id} className="mb-3">
                <LeaveCard
                  leave={leave}
                  onCancel={leave.status === 'pending' ? () => confirmCancel(leave._id) : undefined}
                />
              </View>
            ))}
          </View>

          <View className="h-20" />{/* space for FAB */}
        </View>
      </ScrollView>

      {/* FAB — Apply for Leave */}
      <TouchableOpacity
        onPress={() => navigation.navigate('LeaveApply')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 4 }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
```

---

## 7. Leave Apply Screen

### `src/screens/leaves/LeaveApplyScreen.tsx`

**Behaviour:**
- Form with date range picker, leave type selector, reason textarea
- On submit: calls `POST /api/portal/student/leaves`
- On success: invalidate `['leaves']` cache → navigate back → toast "Leave applied"
- On error: show error below form

**Validation schema:**
```ts
const leaveSchema = z.object({
  fromDate:  z.string().min(1, 'From date is required'),
  toDate:    z.string().min(1, 'To date is required'),
  leaveType: z.enum(['sick', 'personal', 'family', 'other'], { required_error: 'Leave type is required' }),
  reason:    z.string().min(10, 'Reason must be at least 10 characters'),
});
```

**Component structure:**

```tsx
import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StackNavigationProp } from '@react-navigation/stack';
import { apiClient }   from '../../services/api-client';
import { AppButton }   from '../../components/shared/AppButton';
import { AppInput }    from '../../components/shared/AppInput';
import { toast }       from '../../utils/toast';
import type { LeavesStackParamList } from '../../types/navigation';

type Props = { navigation: StackNavigationProp<LeavesStackParamList, 'LeaveApply'> };

const schema = z.object({
  fromDate:  z.string().min(1, 'From date is required'),
  toDate:    z.string().min(1, 'To date is required'),
  leaveType: z.enum(['sick', 'personal', 'family', 'other']),
  reason:    z.string().min(10, 'Reason must be at least 10 characters'),
});
type FormData = z.infer<typeof schema>;

// Leave type options
const LEAVE_TYPE_OPTIONS = [
  { value: 'sick',     label: 'Sick Leave'     },
  { value: 'personal', label: 'Personal Leave'  },
  { value: 'family',   label: 'Family Leave'    },
  { value: 'other',    label: 'Other'            },
] as const;

export function LeaveApplyScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = React.useState('');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fromDate: '', toDate: '', leaveType: 'sick', reason: '' },
  });

  const submitMutation = useMutation({
    mutationFn: (data: FormData) => apiClient.post('/api/portal/student/leaves', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave request submitted.');
      navigation.goBack();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? 'Failed to submit leave.';
      setServerError(msg);
    },
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {serverError ? (
          <View className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-4">
            <Text className="text-sm text-destructive">{serverError}</Text>
          </View>
        ) : null}

        {/* From Date — plain text input; in production use a date picker library */}
        <Controller
          control={control}
          name="fromDate"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="From Date"
              placeholder="YYYY-MM-DD"
              value={value}
              onChangeText={onChange}
              error={errors.fromDate?.message}
              leftIcon="calendar-start"
            />
          )}
        />

        {/* To Date */}
        <Controller
          control={control}
          name="toDate"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="To Date"
              placeholder="YYYY-MM-DD"
              value={value}
              onChangeText={onChange}
              error={errors.toDate?.message}
              leftIcon="calendar-end"
            />
          )}
        />

        {/* Leave type — simple radio-style row selector */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Leave Type</Text>
          <Controller
            control={control}
            name="leaveType"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row flex-wrap gap-2">
                {LEAVE_TYPE_OPTIONS.map((opt) => (
                  <AppButton
                    key={opt.value}
                    variant={value === opt.value ? 'primary' : 'outline'}
                    size="sm"
                    onPress={() => onChange(opt.value)}
                  >
                    {opt.label}
                  </AppButton>
                ))}
              </View>
            )}
          />
          {errors.leaveType && (
            <Text className="text-xs text-destructive mt-1">{errors.leaveType.message}</Text>
          )}
        </View>

        {/* Reason */}
        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Reason"
              placeholder="Describe the reason for leave (min 10 characters)"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              error={errors.reason?.message}
            />
          )}
        />

        {/* Submit */}
        <AppButton
          onPress={handleSubmit((data) => submitMutation.mutate(data))}
          loading={isSubmitting || submitMutation.isPending}
          size="lg"
          className="mt-2"
        >
          Submit Leave Request
        </AppButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

> **Note on date picker:** The above uses plain text input for dates. In production, replace with a date picker library such as `@react-native-community/datetimepicker` or `react-native-date-picker`. The form field value stays as `"YYYY-MM-DD"` string regardless.

---

## 8. Implementation Steps (in order)

1. **Build backend first:**
   a. Extend Leave Mongoose model — add `applicantRole`, `studentId` fields, update indexes
   b. Update Leave Zod validation schema — add `studentLeaveSchema`
   c. Build `GET /api/portal/student/leaves`
   d. Build `POST /api/portal/student/leaves`
   e. Build `DELETE /api/portal/student/leaves/:id`
   f. Test APIs with curl before proceeding to mobile

2. **Build mobile:**
   a. Add leave types to `src/types/models.ts`
   b. Create `src/utils/leaves.ts`
   c. Build `LeavesSkeleton.tsx`
   d. Build `LeaveStatusFilter.tsx`
   e. Build `LeaveCard.tsx`
   f. Build `LeaveRequestsScreen.tsx`
   g. Build `LeaveApplyScreen.tsx`
   h. Replace stub screens

---

## 9. Verification Checklist

### Backend
- [ ] `GET /api/portal/student/leaves` returns student's own leaves, scoped by JWT `studentId`
- [ ] Status filter param works
- [ ] Teacher leaves unaffected — existing leaves still work
- [ ] `POST /api/portal/student/leaves` creates leave with `studentId` from JWT
- [ ] Past date validation: `fromDate` in past → 400 error
- [ ] `toDate` before `fromDate` → 400 error
- [ ] `reason` less than 10 chars → 400 error
- [ ] `DELETE /api/portal/student/leaves/:id` cancels pending leave
- [ ] Cannot cancel approved/rejected/cancelled leave → 400 error
- [ ] Cannot cancel another student's leave → 403 error

### Mobile
- [ ] Leave requests screen loads real data
- [ ] Status filter chips filter list correctly
- [ ] Empty state shown when no leaves
- [ ] Cancel button shown only on pending leaves
- [ ] Cancel shows AlertDialog confirmation before calling API
- [ ] On cancel success: list refreshes, toast shown
- [ ] FAB (+) button navigates to LeaveApplyScreen
- [ ] Leave apply form validates all fields inline
- [ ] Submitting with past date shows error from API
- [ ] Successful submit: navigates back, list refreshes, toast shown
- [ ] TypeScript: `npx tsc --noEmit` passes
