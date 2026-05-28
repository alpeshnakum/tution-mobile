# Phase 11 — Profile Screen

> **Goal:** Build the Profile screen showing all student details (read-only for most fields), with inline editing for phone, email, and address. Also build the Change Password screen. Add the profile update and change password backend APIs to the ERP web app.
>
> **Depends on:** Phase 01 + 02 complete. `useStudentStore` must have `studentId` (populated by Phase 03 dashboard).
>
> **Requires new backend APIs** — build these in the ERP web app BEFORE building the mobile screens.

---

## 1. New Backend APIs (Build in ERP Web App First)

### 1a. `PUT /api/portal/student/profile`

**File:** `app/api/portal/student/profile/route.ts`

**Purpose:** Student can update only their own `phone`, `email`, and `address`. `studentId` is taken from JWT — cannot be overridden from request body.

**Request body:**
```json
{
  "phone":   "9876543210",
  "email":   "student@email.com",
  "address": "123 Main St, Ahmedabad"
}
```

**Validation rules:**
- `phone`: optional, if present must be 10 digits
- `email`: optional, if present must be valid email format
- `address`: optional, free text, max 200 chars
- At least one field must be present

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id":     "student_id",
    "name":    "Ravi Patel",
    "phone":   "9876543210",
    "email":   "student@email.com",
    "address": "123 Main St, Ahmedabad"
  },
  "error": null
}
```

**Response (400 — validation error):**
```json
{ "success": false, "data": null, "error": "Phone must be 10 digits." }
```

**Implementation:**

```ts
// app/api/portal/student/profile/route.ts
import { NextRequest } from 'next/server';
import { connectToDatabase }   from '@/lib/db';
import { getAuthUser }         from '@/lib/auth-helpers';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import Student from '@/lib/models/Student';
import { logActivity }         from '@/lib/services/activity-logger';

const profileUpdateSchema = z.object({
  phone:   z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional(),
  email:   z.string().email('Invalid email format').optional(),
  address: z.string().max(200, 'Address is too long').optional(),
}).refine(
  (v) => v.phone !== undefined || v.email !== undefined || v.address !== undefined,
  { message: 'At least one field is required.' }
);

export async function PUT(req: NextRequest) {
  await connectToDatabase();
  const user = await getAuthUser(req);
  if (!user) return apiError('Unauthorised', 401);
  if (user.role !== 'student') return apiError('Forbidden', 403);
  if (!user.studentId) return apiError('Student ID not found', 400);

  const body = await req.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

  const updateFields: Record<string, string> = {};
  if (parsed.data.phone)   updateFields.phone   = parsed.data.phone;
  if (parsed.data.email)   updateFields.email   = parsed.data.email;
  if (parsed.data.address) updateFields.address = parsed.data.address;

  const updated = await Student.findOneAndUpdate(
    { _id: user.studentId, branchId: user.branchId, isActive: true },
    { $set: updateFields },
    { new: true, lean: true },
  );

  if (!updated) return apiError('Student not found', 404);

  await logActivity({
    userId:   user.userId,
    action:   'update',
    entity:   'student_profile',
    entityId: user.studentId,
    branchId: user.branchId,
  });

  return apiSuccess({ _id: updated._id, name: updated.name, phone: updated.phone, email: updated.email, address: updated.address });
}
```

---

### 1b. `PUT /api/auth/change-password`

**File:** `app/api/auth/change-password/route.ts`

**Purpose:** Authenticated student changes their own password by providing current password (verification) and new password.

**Request body:**
```json
{
  "currentPassword": "OldPass@123",
  "newPassword":     "NewPass@456"
}
```

**Validation rules:**
- `currentPassword`: required, non-empty
- `newPassword`: required, min 8 characters
- `newPassword` must be different from `currentPassword`

**Response (200):**
```json
{ "success": true, "data": { "message": "Password updated successfully." }, "error": null }
```

**Response (400 — wrong current password):**
```json
{ "success": false, "data": null, "error": "Current password is incorrect." }
```

**Implementation:**

```ts
// app/api/auth/change-password/route.ts
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase }   from '@/lib/db';
import { getAuthUser }         from '@/lib/auth-helpers';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import User from '@/lib/models/User';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
}).refine(
  (v) => v.currentPassword !== v.newPassword,
  { message: 'New password must be different from current password.', path: ['newPassword'] }
);

export async function PUT(req: NextRequest) {
  await connectToDatabase();
  const user = await getAuthUser(req);
  if (!user) return apiError('Unauthorised', 401);

  const body = await req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

  // Fetch user with password hash (don't use .lean() since we need the full doc to update)
  const dbUser = await User.findById(user.userId).select('+password');
  if (!dbUser) return apiError('User not found', 404);

  const isMatch = await bcrypt.compare(parsed.data.currentPassword, dbUser.password);
  if (!isMatch) return apiError('Current password is incorrect.', 400);

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await User.findByIdAndUpdate(user.userId, { password: newHash });

  return apiSuccess({ message: 'Password updated successfully.' });
}
```

---

## 2. TypeScript Types

No new model types needed. All data comes from `DashboardData.student` already loaded in Phase 03.

Add to `src/services/auth-service.ts`:

```ts
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword:     string;
}

// Add to authService object:
async changePassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.put('/api/auth/change-password', payload);
},

// Add to authService:
async updateProfile(payload: { phone?: string; email?: string; address?: string }): Promise<Student> {
  const { data } = await apiClient.put<ApiResponse<Student>>('/api/portal/student/profile', payload);
  return data.data;
},
```

---

## 3. New Files to Create

```
src/screens/profile/ProfileScreen.tsx
src/screens/profile/ChangePasswordScreen.tsx
src/components/profile/ProfileField.tsx
src/components/profile/EditableProfileField.tsx
src/components/profile/ProfileSkeleton.tsx
```

---

## 4. Component Specifications

### `ProfileField.tsx` (read-only field row)

**Props:**
```ts
interface ProfileFieldProps {
  label: string;
  value: string | null | undefined;
  icon?: string;
}
```

**Visual:**
- Two-line row: label (muted, small) + value (foreground, base)
- Optional icon on the left
- Value shows "—" in muted colour if null/empty

---

### `EditableProfileField.tsx` (field with edit button)

**Props:**
```ts
interface EditableProfileFieldProps {
  label:       string;
  value:       string | null | undefined;
  onSave:      (newValue: string) => Promise<void>;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  validate?:   (value: string) => string | undefined; // returns error message or undefined
}
```

**Behaviour:**
- Default state: shows value + pencil icon (edit button)
- Edit state: shows text input (pre-filled with current value) + Save and Cancel buttons
- `onSave` is called with the new value
- While saving: shows loading spinner on Save button
- On save error: shows inline error below input
- On save success: returns to display state with updated value

**Visual:**
```
Phone           9876543210    [✏️]
                                    ↓ tap pencil
Phone           [9876543210    ] [Save] [✕]
```

---

### `ProfileSkeleton.tsx`

Skeleton placeholders:
- Avatar circle: 80px circle
- Name block: width 150, height 24
- 8 field rows: each height 44

---

## 5. Profile Screen

### `src/screens/profile/ProfileScreen.tsx`

```tsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient }               from '../../services/api-client';
import { useStudentStore }         from '../../stores/student-store';
import { useBiometric }            from '../../hooks/use-biometric';
import { ProfileField }            from '../../components/profile/ProfileField';
import { EditableProfileField }    from '../../components/profile/EditableProfileField';
import { ProfileSkeleton }         from '../../components/profile/ProfileSkeleton';
import { AppCard }                 from '../../components/shared/AppCard';
import { AppButton }               from '../../components/shared/AppButton';
import { useLogout }               from '../../hooks/use-logout';
import { toast }                   from '../../utils/toast';
import { formatDate }              from '../../utils/format';
import type { ApiResponse, Student } from '../../types/api';
import type { ProfileStackParamList } from '../../types/navigation';

type Props = { navigation: StackNavigationProp<ProfileStackParamList, 'Profile'> };

async function fetchStudentProfile(): Promise<Student> {
  // Reuse dashboard API which returns student details
  const { data } = await apiClient.get<ApiResponse<{ student: Student }>>('/api/portal/student/dashboard');
  return data.data.student;
}

export function ProfileScreen({ navigation }: Props) {
  const { studentName } = useStudentStore();
  const queryClient     = useQueryClient();
  const bio             = useBiometric();
  const logout          = useLogout();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn:  fetchStudentProfile,
    // Try to read from dashboard cache if available
    initialData: () => {
      const dashCache = queryClient.getQueryData<{ student: Student }>(['student-dashboard']);
      return dashCache?.student;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { phone?: string; email?: string; address?: string }) =>
      apiClient.put<ApiResponse<Student>>('/api/portal/student/profile', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? 'Update failed.';
      throw new Error(msg); // EditableProfileField catches and shows it inline
    },
  });

  const handleFieldSave = async (field: 'phone' | 'email' | 'address', value: string) => {
    await updateMutation.mutateAsync({ [field]: value });
    toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated.`);
  };

  if (isLoading) return <ProfileSkeleton />;

  const initials = (studentName ?? 'S')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const biometricEnabled = bio.isBiometricEnabled();

  return (
    <ScrollView className="flex-1 bg-background">
      {/* ── Avatar + Name ─────────────────────────────────── */}
      <View className="items-center px-4 pt-6 pb-4 bg-primary/5 border-b border-border">
        <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
          <Text className="text-white text-2xl font-bold">{initials}</Text>
        </View>
        <Text className="text-xl font-bold text-foreground">{student?.name}</Text>
        <Text className="text-sm text-muted mt-1">
          {[student?.className, student?.sectionName].filter(Boolean).join(' · ')}
        </Text>
        <Text className="text-xs text-muted mt-0.5">{student?.admissionNumber}</Text>
      </View>

      <View className="px-4 py-4">
        {/* ── Personal Details (read-only) ──────────────────── */}
        <AppCard className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">Personal Details</Text>
          <ProfileField label="Full Name"       value={student?.name} />
          <ProfileField label="Date of Birth"   value={student?.dateOfBirth ? formatDate(student.dateOfBirth) : null} />
          <ProfileField label="Gender"          value={student?.gender} />
          <ProfileField label="Blood Group"     value={student?.bloodGroup} />
          <ProfileField label="Roll Number"     value={student?.rollNumber} />
          <ProfileField label="Admission No."   value={student?.admissionNumber} />
          <ProfileField label="Class"           value={student?.className} />
          <ProfileField label="Section"         value={student?.sectionName} />
        </AppCard>

        {/* ── Contact Details (editable) ────────────────────── */}
        <AppCard className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">Contact Details</Text>
          <EditableProfileField
            label="Phone"
            value={student?.phone}
            keyboardType="phone-pad"
            onSave={(v) => handleFieldSave('phone', v)}
            validate={(v) => /^\d{10}$/.test(v) ? undefined : 'Phone must be 10 digits'}
          />
          <EditableProfileField
            label="Email"
            value={student?.email}
            keyboardType="email-address"
            onSave={(v) => handleFieldSave('email', v)}
            validate={(v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : 'Invalid email'}
          />
          <EditableProfileField
            label="Address"
            value={student?.address}
            onSave={(v) => handleFieldSave('address', v)}
          />
        </AppCard>

        {/* ── Account Settings ──────────────────────────────── */}
        <AppCard className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">Account</Text>

          {/* Change Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ChangePassword')}
            className="flex-row items-center justify-between py-3 border-b border-border"
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="lock-reset" size={18} color="#6B6862" />
              <Text className="text-sm text-foreground ml-3">Change Password</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#6B6862" />
          </TouchableOpacity>

          {/* Biometric toggle */}
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="fingerprint" size={18} color="#6B6862" />
              <Text className="text-sm text-foreground ml-3">Biometric Login</Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                const available = await bio.isBiometricAvailable();
                if (!available) {
                  Alert.alert('Not Available', 'Biometric authentication is not set up on this device.');
                  return;
                }
                if (biometricEnabled) {
                  bio.disableBiometrics();
                  toast.success('Biometric login disabled.');
                } else {
                  const ok = await bio.authenticateWithBiometrics();
                  if (ok) {
                    bio.enableBiometrics();
                    toast.success('Biometric login enabled.');
                  }
                }
              }}
              className={`w-12 h-6 rounded-full items-center justify-center ${biometricEnabled ? 'bg-primary' : 'bg-surface-muted border border-border'}`}
            >
              <View className={`w-5 h-5 rounded-full bg-white shadow-sm absolute ${biometricEnabled ? 'right-0.5' : 'left-0.5'}`} />
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* ── App Info ──────────────────────────────────────── */}
        <Text className="text-xs text-muted text-center mb-6">OAC Student App v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
```

---

## 6. Change Password Screen

### `src/screens/profile/ChangePasswordScreen.tsx`

```tsx
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { StackNavigationProp } from '@react-navigation/stack';
import { apiClient }   from '../../services/api-client';
import { AppInput }    from '../../components/shared/AppInput';
import { AppButton }   from '../../components/shared/AppButton';
import { toast }       from '../../utils/toast';
import type { ProfileStackParamList } from '../../types/navigation';

type Props = { navigation: StackNavigationProp<ProfileStackParamList, 'ChangePassword'> };

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(
  (v) => v.newPassword === v.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
).refine(
  (v) => v.currentPassword !== v.newPassword,
  { message: 'New password must be different from current password', path: ['newPassword'] }
);

type FormData = z.infer<typeof schema>;

export function ChangePasswordScreen({ navigation }: Props) {
  const [serverError, setServerError] = useState('');

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: FormData) => {
    setServerError('');
    try {
      await apiClient.put('/api/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword:     values.newPassword,
      });
      toast.success('Password changed successfully.');
      reset();
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Failed to change password.';
      setServerError(msg);
    }
  };

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

        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Current Password"
              placeholder="Enter current password"
              secureTextEntry
              leftIcon="lock-outline"
              value={value}
              onChangeText={onChange}
              error={errors.currentPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="New Password"
              placeholder="Minimum 8 characters"
              secureTextEntry
              leftIcon="lock-plus-outline"
              value={value}
              onChangeText={onChange}
              error={errors.newPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              secureTextEntry
              leftIcon="lock-check-outline"
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <AppButton
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          size="lg"
          className="mt-2"
        >
          Change Password
        </AppButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

---

## 7. Implementation Steps (in order)

1. **Build backend first:**
   a. Build `PUT /api/portal/student/profile` with Zod validation
   b. Build `PUT /api/auth/change-password` with bcrypt verification
   c. Test with curl: correct data → 200; wrong current password → 400; validation errors → 400

2. **Build mobile:**
   a. Build `ProfileSkeleton.tsx`
   b. Build `ProfileField.tsx`
   c. Build `EditableProfileField.tsx` (with edit mode toggle + save/cancel + loading + inline error)
   d. Build `ProfileScreen.tsx`
   e. Build `ChangePasswordScreen.tsx`
   f. Add `changePassword` and `updateProfile` methods to `authService`
   g. Replace stub screens

---

## 8. Verification Checklist

### Backend
- [ ] `PUT /api/portal/student/profile` — only updates phone/email/address
- [ ] Cannot update name, class, admission number, etc. via this endpoint
- [ ] studentId comes from JWT, not request body
- [ ] Phone validation: non-10-digit string → 400
- [ ] Email validation: invalid format → 400
- [ ] Empty body (no fields) → 400 "At least one field is required"
- [ ] `PUT /api/auth/change-password` — wrong current password → 400
- [ ] New password same as current → 400
- [ ] New password < 8 chars → 400
- [ ] Passwords don't match (confirmed by zod on mobile only) — API doesn't need confirmPassword

### Mobile
- [ ] Profile screen loads student data (reuses dashboard cache)
- [ ] Read-only fields (name, DOB, class, admission #, etc.) are NOT editable
- [ ] Editable fields (phone, email, address) show pencil icon
- [ ] Tapping pencil switches to edit mode with current value pre-filled
- [ ] Save calls API and updates displayed value
- [ ] Cancel returns to display mode without changes
- [ ] Validation error shown inline (e.g., "Phone must be 10 digits")
- [ ] API error shown inline in edit field
- [ ] Biometric toggle enables/disables correctly
- [ ] Biometric toggle prompts authentication before enabling
- [ ] Change Password screen validates all fields inline
- [ ] Wrong current password → server error shown below form
- [ ] Passwords don't match → inline error on confirm field
- [ ] Successful password change → toast + navigate back to Profile
- [ ] TypeScript: `npx tsc --noEmit` passes
