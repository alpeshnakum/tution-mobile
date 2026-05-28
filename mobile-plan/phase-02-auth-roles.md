# Phase 02 — Authentication & Drawer Navigation

> **Goal:** Implement complete auth lifecycle — login, forgot password (email OTP), reset password, session persistence, token refresh, biometric unlock, logout — and wire the student drawer navigation. After this phase a student can log in, be auto-logged-in on restart, use biometric unlock, and navigate the full sidebar drawer.
>
> **Depends on:** Phase 01 complete — `apiClient`, `authService`, `useAuthStore`, `useStudentStore`, MMKV/SecureStore helpers, `AppButton`, `AppInput`, base components all must exist.

---

## 1. New Backend APIs (Build in Web ERP First)

Both APIs must exist in the ERP web app before the mobile forgot-password flow can be tested.

### `POST /api/auth/forgot-password`

**Purpose:** Accept a student's username or email, generate a 6-digit OTP, store it in MongoDB with a 10-minute expiry, and email it to the student's registered email address.

**Request body:**
```json
{ "username": "student123" }
```
or
```json
{ "username": "student@email.com" }
```

**Response (200 — always return 200 even if user not found, to prevent enumeration):**
```json
{ "success": true, "data": { "message": "If an account exists, an OTP has been sent." }, "error": null }
```

**Response (dev mode only — return OTP in response for testing):**
```json
{ "success": true, "data": { "message": "...", "otp": "123456" }, "error": null }
```

**Backend implementation notes:**
- Create a `PasswordResetOTP` Mongoose model: `{ username, otp, expiresAt, branchId, isUsed }`
- OTP is 6-digit random number: `Math.floor(100000 + Math.random() * 900000).toString()`
- `expiresAt` = `new Date(Date.now() + 10 * 60 * 1000)` (10 minutes)
- Hash the OTP before storing (bcrypt or SHA-256)
- Delete any existing OTP for that username before creating new one
- Email sending: if email service not configured, skip sending but still return success (dev mode returns raw OTP)
- Only allow students (`role: 'student'`) to use this endpoint

---

### `POST /api/auth/reset-password`

**Purpose:** Verify OTP and update the student's password.

**Request body:**
```json
{
  "username": "student123",
  "otp": "123456",
  "newPassword": "NewPass@123"
}
```

**Response (200):**
```json
{ "success": true, "data": { "message": "Password updated successfully." }, "error": null }
```

**Response (400 — invalid/expired OTP):**
```json
{ "success": false, "data": null, "error": "OTP is invalid or has expired." }
```

**Backend implementation notes:**
- Find OTP record for username where `isUsed: false` and `expiresAt > now`
- Verify OTP hash matches
- Update user's password hash (bcrypt, same as existing auth)
- Set `isUsed: true` on OTP record (or delete it)
- Only allow `role: 'student'`

---

## 2. Auth Flow Overview

```
App launch
    │
    ▼
useSessionRestore hook runs
    │
    ├─ No accessToken in MMKV → show Login
    │
    ├─ Token found → isTokenExpired()?
    │       │
    │       ├─ Not expired → decode JWT → setUser → isAuthenticated = true → StudentDrawer
    │       │
    │       └─ Expired → call /api/auth/refresh with SecureStore refreshToken
    │               │
    │               ├─ Refresh success → save new accessToken → StudentDrawer
    │               └─ Refresh fail → clear all tokens → show Login
    │
    └─ isInitialized = true (always, regardless of outcome)
```

---

## 3. Session Restore Hook

### `src/hooks/use-session-restore.ts`

```ts
import { useEffect } from 'react';
import axios from 'axios';
import { mmkv, secureStore, STORAGE_KEYS, SECURE_KEYS } from '../services/storage';
import { useAuthStore } from '../stores/auth-store';
import { useStudentStore } from '../stores/student-store';
import { decodeJwt, isTokenExpired } from '../utils/jwt';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useSessionRestore() {
  const { login, logout, setInitialized } = useAuthStore();

  useEffect(() => {
    async function restore() {
      try {
        const token = mmkv.get(STORAGE_KEYS.ACCESS_TOKEN);

        if (!token) {
          return; // No token — stay on Login
        }

        if (!isTokenExpired(token)) {
          // Valid token — decode and restore session
          const payload = decodeJwt(token);
          if (payload && payload.role === 'student') {
            login(
              {
                userId:    payload.userId,
                studentId: payload.studentId,
                branchId:  payload.branchId,
                role:      payload.role,
                name:      '',   // populated from dashboard in Phase 03
                username:  '',
              },
              token,
            );
          }
          return;
        }

        // Token expired — try refresh
        const refreshToken = await secureStore.get(SECURE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          mmkv.delete(STORAGE_KEYS.ACCESS_TOKEN);
          return;
        }

        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        const newAccessToken: string = data.data.accessToken;

        mmkv.set(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        const payload = decodeJwt(newAccessToken);
        if (payload && payload.role === 'student') {
          login(
            {
              userId:    payload.userId,
              studentId: payload.studentId,
              branchId:  payload.branchId,
              role:      payload.role,
              name:      '',
              username:  '',
            },
            newAccessToken,
          );
        }
      } catch {
        // Refresh failed — clear everything
        mmkv.delete(STORAGE_KEYS.ACCESS_TOKEN);
        await secureStore.delete(SECURE_KEYS.REFRESH_TOKEN);
        logout();
      } finally {
        setInitialized(true);
      }
    }

    restore();
  }, []);
}
```

---

## 4. Logout Hook

### `src/hooks/use-logout.ts`

```ts
import { useCallback } from 'react';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../stores/auth-store';
import { useStudentStore } from '../stores/student-store';
import { mmkv, secureStore, STORAGE_KEYS, SECURE_KEYS } from '../services/storage';

export function useLogout() {
  const { logout: clearAuth } = useAuthStore();
  const { clearStudentInfo }   = useStudentStore();

  return useCallback(async () => {
    // Best-effort server logout (don't block on failure)
    authService.logout().catch(() => {});

    // Clear local storage
    mmkv.delete(STORAGE_KEYS.ACCESS_TOKEN);
    mmkv.delete(STORAGE_KEYS.REMEMBER_ME);
    await secureStore.delete(SECURE_KEYS.REFRESH_TOKEN);

    // Clear stores — RootNavigator will redirect to Login automatically
    clearStudentInfo();
    clearAuth();
  }, [clearAuth, clearStudentInfo]);
}
```

---

## 5. Biometric Hook

### `src/hooks/use-biometric.ts`

```ts
import * as LocalAuthentication from 'expo-local-authentication';
import { mmkv, STORAGE_KEYS } from '../services/storage';

export function useBiometric() {
  async function isBiometricAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled   = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  function isBiometricEnabled(): boolean {
    return mmkv.getBool(STORAGE_KEYS.BIOMETRIC_ENABLED);
  }

  function enableBiometrics(): void {
    mmkv.setBool(STORAGE_KEYS.BIOMETRIC_ENABLED, true);
  }

  function disableBiometrics(): void {
    mmkv.setBool(STORAGE_KEYS.BIOMETRIC_ENABLED, false);
  }

  async function authenticateWithBiometrics(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock OAC Student App',
      fallbackLabel: 'Use password',
      cancelLabel:   'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  }

  return {
    isBiometricAvailable,
    isBiometricEnabled,
    enableBiometrics,
    disableBiometrics,
    authenticateWithBiometrics,
  };
}
```

---

## 6. Navigation Files

### `src/navigation/RootNavigator.tsx`

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore, useIsAuthenticated, useIsInitialized } from '../stores/auth-store';
import { useSessionRestore } from '../hooks/use-session-restore';
import { AppLoader } from '../components/shared/AppLoader';
import { AuthNavigator } from './AuthNavigator';
import { StudentDrawer } from './StudentDrawer';

export function RootNavigator() {
  useSessionRestore(); // runs once on mount, restores session from MMKV

  const isAuthenticated = useIsAuthenticated();
  const isInitialized   = useIsInitialized();

  if (!isInitialized) {
    return <AppLoader fullScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <StudentDrawer /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
```

---

### `src/navigation/AuthNavigator.tsx`

```tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from '../types/navigation';
import { LoginScreen }          from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen }  from '../screens/auth/ResetPasswordScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword"  component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
```

---

### `src/navigation/StudentDrawer.tsx`

```tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator }  from '@react-navigation/stack';
import type { StudentDrawerParamList } from '../types/navigation';

import { DrawerContent }         from './DrawerContent';
import { DashboardScreen }       from '../screens/dashboard/DashboardScreen';
import { AttendanceScreen }      from '../screens/attendance/AttendanceScreen';
import { FeeScreen }             from '../screens/fees/FeeScreen';
import { FeeReceiptScreen }      from '../screens/fees/FeeReceiptScreen';
import { ResultsScreen }         from '../screens/results/ResultsScreen';
import { HomeworkScreen }        from '../screens/homework/HomeworkScreen';
import { HomeworkDetailScreen }  from '../screens/homework/HomeworkDetailScreen';
import { TimetableScreen }       from '../screens/timetable/TimetableScreen';
import { LeaveRequestsScreen }   from '../screens/leaves/LeaveRequestsScreen';
import { LeaveApplyScreen }      from '../screens/leaves/LeaveApplyScreen';
import { NotificationsScreen }   from '../screens/notifications/NotificationsScreen';
import { NotificationDetailScreen } from '../screens/notifications/NotificationDetailScreen';
import { ProfileScreen }         from '../screens/profile/ProfileScreen';
import { ChangePasswordScreen }  from '../screens/profile/ChangePasswordScreen';

const Drawer = createDrawerNavigator<StudentDrawerParamList>();

// ── Helper: creates a simple Stack wrapper for each drawer section ──
function makeStack<T extends Record<string, object | undefined>>(
  screens: Array<{ name: keyof T; component: React.ComponentType<any>; title: string }>,
): React.FC {
  const Stack = createStackNavigator<T>();
  return () => (
    <Stack.Navigator>
      {screens.map(({ name, component, title }) => (
        <Stack.Screen
          key={String(name)}
          name={name as string}
          component={component}
          options={{ title }}
        />
      ))}
    </Stack.Navigator>
  );
}

const DashboardStack = makeStack([
  { name: 'Dashboard',  component: DashboardScreen,  title: 'Dashboard' },
]);
const AttendanceStack = makeStack([
  { name: 'Attendance', component: AttendanceScreen, title: 'Attendance' },
]);
const FeesStack = makeStack([
  { name: 'Fees',       component: FeeScreen,        title: 'Fees' },
  { name: 'FeeReceipt', component: FeeReceiptScreen, title: 'Receipt' },
]);
const ResultsStack = makeStack([
  { name: 'Results',    component: ResultsScreen,    title: 'Results' },
]);
const HomeworkStack = makeStack([
  { name: 'Homework',       component: HomeworkScreen,       title: 'Homework' },
  { name: 'HomeworkDetail', component: HomeworkDetailScreen, title: 'Homework Detail' },
]);
const TimetableStack = makeStack([
  { name: 'Timetable',  component: TimetableScreen,  title: 'Timetable' },
]);
const LeavesStack = makeStack([
  { name: 'LeaveRequests', component: LeaveRequestsScreen, title: 'Leave Requests' },
  { name: 'LeaveApply',    component: LeaveApplyScreen,    title: 'Apply for Leave' },
]);
const NotificationsStack = makeStack([
  { name: 'Notifications',      component: NotificationsScreen,       title: 'Notifications' },
  { name: 'NotificationDetail', component: NotificationDetailScreen,  title: 'Notification' },
]);
const ProfileStack = makeStack([
  { name: 'Profile',        component: ProfileScreen,        title: 'Profile' },
  { name: 'ChangePassword', component: ChangePasswordScreen, title: 'Change Password' },
]);

export function StudentDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardStack"
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle:           { backgroundColor: '#FAF9F5' },
        headerTintColor:       '#1F1E1D',
        headerTitleStyle:      { fontWeight: '600' },
        drawerStyle:           { backgroundColor: '#FAF9F5', width: 280 },
        drawerActiveTintColor: '#CC785C',
        drawerInactiveTintColor:'#6B6862',
      }}
    >
      <Drawer.Screen name="DashboardStack"    component={DashboardStack}    options={{ title: 'Dashboard',      drawerIcon: ({ color }) => <Icon name="view-dashboard-outline" color={color} /> }} />
      <Drawer.Screen name="AttendanceStack"   component={AttendanceStack}   options={{ title: 'Attendance',     drawerIcon: ({ color }) => <Icon name="calendar-check-outline"  color={color} /> }} />
      <Drawer.Screen name="FeesStack"         component={FeesStack}         options={{ title: 'Fees',           drawerIcon: ({ color }) => <Icon name="currency-inr"            color={color} /> }} />
      <Drawer.Screen name="ResultsStack"      component={ResultsStack}      options={{ title: 'Results',        drawerIcon: ({ color }) => <Icon name="chart-bar"               color={color} /> }} />
      <Drawer.Screen name="HomeworkStack"     component={HomeworkStack}     options={{ title: 'Homework',       drawerIcon: ({ color }) => <Icon name="book-open-outline"       color={color} /> }} />
      <Drawer.Screen name="TimetableStack"    component={TimetableStack}    options={{ title: 'Timetable',      drawerIcon: ({ color }) => <Icon name="timetable"               color={color} /> }} />
      <Drawer.Screen name="LeavesStack"       component={LeavesStack}       options={{ title: 'Leave Requests', drawerIcon: ({ color }) => <Icon name="calendar-remove-outline" color={color} /> }} />
      <Drawer.Screen name="NotificationsStack"component={NotificationsStack}options={{ title: 'Notifications',  drawerIcon: ({ color }) => <Icon name="bell-outline"            color={color} /> }} />
      <Drawer.Screen name="ProfileStack"      component={ProfileStack}      options={{ title: 'Profile',        drawerIcon: ({ color }) => <Icon name="account-circle-outline"  color={color} /> }} />
    </Drawer.Navigator>
  );
}

// Small helper to avoid repetition
import { MaterialCommunityIcons } from '@expo/vector-icons';
function Icon({ name, color }: { name: string; color: string }) {
  return <MaterialCommunityIcons name={name as any} size={22} color={color} />;
}
```

---

### `src/navigation/DrawerContent.tsx`

Custom sidebar component rendered inside the drawer. Shows student info header + menu list + logout.

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStudentStore } from '../stores/student-store';
import { useLogout }       from '../hooks/use-logout';

export function DrawerContent(props: DrawerContentComponentProps) {
  const { studentName, className, sectionName } = useStudentStore();
  const logout = useLogout();

  const initials = (studentName ?? 'S')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View className="flex-1 bg-background">
      {/* ── Student Header ────────────────────────────────── */}
      <View className="bg-primary/10 px-5 pt-12 pb-5">
        {/* Avatar circle with initials */}
        <View className="w-14 h-14 rounded-full bg-primary items-center justify-center mb-3">
          <Text className="text-white text-xl font-bold">{initials}</Text>
        </View>
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {studentName ?? 'Student'}
        </Text>
        <Text className="text-sm text-muted mt-0.5">
          {[className, sectionName].filter(Boolean).join(' · ') || 'Loading...'}
        </Text>
      </View>

      {/* ── Menu Items ────────────────────────────────────── */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 8 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* ── Footer: version + logout ──────────────────────── */}
      <View className="border-t border-border px-5 py-4">
        <TouchableOpacity
          onPress={logout}
          className="flex-row items-center py-2"
        >
          <MaterialCommunityIcons name="logout" size={20} color="#C44536" />
          <Text className="ml-3 text-sm font-medium text-destructive">Logout</Text>
        </TouchableOpacity>
        <Text className="text-xs text-muted mt-2">OAC Student App v1.0.0</Text>
      </View>
    </View>
  );
}
```

---

## 7. Auth Screens

### `src/screens/auth/LoginScreen.tsx`

**Behaviour:**
- Form fields: `username`, `password`
- "Remember me" checkbox: saves username to MMKV on submit if checked, clears on uncheck
- Password field: show/hide toggle (built into `AppInput`)
- "Forgot Password?" link navigates to `ForgotPasswordScreen`
- On success: saves `accessToken` to MMKV, `refreshToken` to SecureStore, calls `useAuthStore.login()`, populates `useStudentStore`
- On error: shows server error message below form (not a toast)
- After first successful login: checks `isBiometricAvailable()` → if yes and not yet prompted → shows modal "Enable biometric login?"
- If biometric already enabled on next app open: shows biometric prompt. On success: no password needed, restores session normally via `useSessionRestore`. On failure/cancel: show normal login form.

**Validation schema:**
```ts
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});
```

**Full component structure:**
```tsx
// src/screens/auth/LoginScreen.tsx
'use client'; // NOT needed in RN — but just for reference
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';
import { AppInput }  from '../../components/shared/AppInput';
import { AppButton } from '../../components/shared/AppButton';
import { authService } from '../../services/auth-service';
import { useAuthStore } from '../../stores/auth-store';
import { useStudentStore } from '../../stores/student-store';
import { mmkv, secureStore, STORAGE_KEYS, SECURE_KEYS } from '../../services/storage';
import { useBiometric } from '../../hooks/use-biometric';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'Login'> };

const schema = z.object({
  username:   z.string().min(1, 'Username is required'),
  password:   z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

export function LoginScreen({ navigation }: Props) {
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);
  const { login: storeLogin }         = useAuthStore();
  const { setStudentInfo }            = useStudentStore();
  const bio = useBiometric();

  const savedUsername = mmkv.get(STORAGE_KEYS.SAVED_USERNAME);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: savedUsername ?? '', password: '', rememberMe: !!savedUsername },
  });

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    setServerError('');
    try {
      const result = await authService.login({ username: values.username, password: values.password });

      // Save tokens
      mmkv.set(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken);
      await secureStore.set(SECURE_KEYS.REFRESH_TOKEN, result.refreshToken);

      // Remember me
      if (values.rememberMe) {
        mmkv.set(STORAGE_KEYS.SAVED_USERNAME, values.username);
      } else {
        mmkv.delete(STORAGE_KEYS.SAVED_USERNAME);
      }

      // Update stores
      storeLogin(result.user, result.accessToken);
      setStudentInfo({
        studentId:   result.studentId,
        studentName: result.user.name,
        classId:     result.classId,
        sectionId:   result.sectionId,
        sessionId:   result.sessionId,
        branchId:    result.branchId,
        className:   null, // populated from dashboard in Phase 03
        sectionName: null,
        rollNumber:  null,
      });

      // Prompt biometric enrollment on first login
      const available = await bio.isBiometricAvailable();
      const alreadyEnabled = bio.isBiometricEnabled();
      if (available && !alreadyEnabled) {
        // Show "Enable biometric?" — implement as an Alert or Modal
        // If user taps Yes: bio.enableBiometrics()
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? 'Login failed. Check credentials.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6">
          {/* Logo / title */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-xl bg-primary items-center justify-center mb-4">
              <MaterialCommunityIcons name="school" size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-foreground">OAC Student</Text>
            <Text className="text-sm text-muted mt-1">Sign in to your account</Text>
          </View>

          {/* Server error banner */}
          {serverError ? (
            <View className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-4">
              <Text className="text-sm text-destructive">{serverError}</Text>
            </View>
          ) : null}

          {/* Username */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value, onBlur } }) => (
              <AppInput
                label="Username"
                placeholder="Enter your username"
                leftIcon="account-outline"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.username?.message}
              />
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <AppInput
                label="Password"
                placeholder="Enter your password"
                leftIcon="lock-outline"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {/* Remember me + Forgot password row */}
          <View className="flex-row items-center justify-between mb-6">
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity onPress={() => onChange(!value)} className="flex-row items-center">
                  <View className={`w-4 h-4 rounded border mr-2 items-center justify-center ${value ? 'bg-primary border-primary' : 'border-input'}`}>
                    {value && <MaterialCommunityIcons name="check" size={12} color="white" />}
                  </View>
                  <Text className="text-sm text-muted">Remember me</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text className="text-sm text-primary font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <AppButton onPress={handleSubmit(onSubmit)} loading={loading} size="lg">
            Sign In
          </AppButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

---

### `src/screens/auth/ForgotPasswordScreen.tsx`

**Behaviour:**
- Single field: `username` (or email)
- Submit calls `POST /api/auth/forgot-password`
- On success: navigates to `ResetPasswordScreen` with `username` param
- Shows generic success message (doesn't confirm if account exists)
- Shows error if API fails

**Validation:**
```ts
const schema = z.object({
  username: z.string().min(1, 'Username or email is required'),
});
```

**Structure:**
- Back button (header back arrow)
- Title: "Forgot Password"
- Subtitle: "Enter your username or email. If an account exists, we'll send an OTP."
- Username/email input
- Submit button "Send OTP"
- On success: navigate to ResetPasswordScreen passing `{ username: values.username }`

---

### `src/screens/auth/ResetPasswordScreen.tsx`

**Props:** `route.params.username: string`

**Behaviour:**
- Fields: `otp` (6-digit), `newPassword`, `confirmPassword`
- Submit calls `POST /api/auth/reset-password`
- On success: show toast "Password updated" → navigate back to Login

**Validation:**
```ts
const schema = z.object({
  otp:            z.string().length(6, 'OTP must be 6 digits'),
  newPassword:    z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword:z.string(),
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});
```

**Structure:**
- Title: "Reset Password"
- Subtitle: "Enter the OTP sent to your registered email."
- OTP field (numeric, length 6)
- New password field (with show/hide)
- Confirm password field (with show/hide)
- Submit button "Reset Password"
- Back to Login link

---

## 8. Stub Screens (create empty components for all remaining screens)

Create these as minimal stubs so navigation works end-to-end in Phase 02. Actual implementation is in Phases 03–11.

```tsx
// Template for each stub — replace 'Dashboard' with the actual screen name
// src/screens/dashboard/DashboardScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
export function DashboardScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground text-lg">Dashboard — Coming in Phase 03</Text>
    </View>
  );
}
```

Create stub files at:
- `src/screens/attendance/AttendanceScreen.tsx`
- `src/screens/fees/FeeScreen.tsx`
- `src/screens/fees/FeeReceiptScreen.tsx`
- `src/screens/results/ResultsScreen.tsx`
- `src/screens/homework/HomeworkScreen.tsx`
- `src/screens/homework/HomeworkDetailScreen.tsx`
- `src/screens/timetable/TimetableScreen.tsx`
- `src/screens/leaves/LeaveRequestsScreen.tsx`
- `src/screens/leaves/LeaveApplyScreen.tsx`
- `src/screens/notifications/NotificationsScreen.tsx`
- `src/screens/notifications/NotificationDetailScreen.tsx`
- `src/screens/profile/ProfileScreen.tsx`
- `src/screens/profile/ChangePasswordScreen.tsx`

---

## 9. Implementation Steps (in order)

1. Build new backend APIs in ERP web: `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`
2. Create `src/hooks/use-session-restore.ts`
3. Create `src/hooks/use-logout.ts`
4. Create `src/hooks/use-biometric.ts`
5. Create `src/navigation/RootNavigator.tsx`
6. Create `src/navigation/AuthNavigator.tsx`
7. Create all stub screens (Section 8)
8. Create `src/navigation/StudentDrawer.tsx`
9. Create `src/navigation/DrawerContent.tsx`
10. Build `src/screens/auth/LoginScreen.tsx`
11. Build `src/screens/auth/ForgotPasswordScreen.tsx`
12. Build `src/screens/auth/ResetPasswordScreen.tsx`
13. Update `App.tsx` to use `RootNavigator`
14. Test end-to-end: launch app → login → see drawer → navigate all stubs → logout → see login again

---

## 10. Verification Checklist

- [ ] App shows login screen on fresh launch (no token)
- [ ] App auto-logs-in when valid token in MMKV
- [ ] App shows login when token is expired and refresh fails
- [ ] Login with correct credentials → stores tokens → shows drawer
- [ ] Login with wrong credentials → shows error message below form (not a toast)
- [ ] "Remember me" saves username; unchecking clears it
- [ ] "Forgot Password?" navigates to ForgotPasswordScreen
- [ ] ForgotPassword submits → navigates to ResetPasswordScreen with username param
- [ ] ResetPassword submits correct OTP → navigates to Login with success message
- [ ] ResetPassword with wrong OTP → shows "OTP is invalid or has expired" error
- [ ] Drawer opens when hamburger icon tapped
- [ ] All 9 drawer items navigate to their stub screens without crashing
- [ ] Logout button in drawer → clears tokens → shows Login screen
- [ ] Drawer header shows student initials, name, class+section
- [ ] Biometric prompt appears after first login (if device supports it)
- [ ] Biometric unlock works on subsequent app opens (if enabled)
- [ ] TypeScript: `npx tsc --noEmit` passes with 0 errors
