# Phase 01 — Foundation & Project Setup

> **Goal:** Bootstrap the React Native Expo app with production-ready project structure, Axios API client with JWT interceptors, MMKV + SecureStore storage layer, NativeWind theme matching the web ERP exactly (terracotta/cream), Zustand auth + student stores, and all shared base components. Every decision here is a dependency for every subsequent phase.
>
> **Depends on:** Nothing — this is Phase 1.
>
> **No backend changes required.**

---

## 1. Create Expo Project

```bash
npx create-expo-app student-app --template blank-typescript
cd student-app
```

---

## 2. Install All Dependencies

Run in order:

```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/drawer @react-navigation/stack
npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context

# Styling
npm install nativewind tailwindcss

# State & Data
npm install zustand @tanstack/react-query

# HTTP
npm install axios

# Storage
npx expo install expo-secure-store react-native-mmkv

# Biometric (installed now, used in Phase 02)
npx expo install expo-local-authentication

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Network detection
npx expo install @react-native-community/netinfo

# Date utilities
npm install date-fns

# Dev dependencies
npm install -D @types/react-native tailwindcss
```

---

## 3. Dependencies Reference Table

| Package | Version | Purpose |
|---------|---------|---------|
| expo | ~51.x | Managed workflow |
| react-native | 0.74.x | Core framework |
| typescript | ^5.3 | Type safety |
| @react-navigation/native | ^6.x | Navigation container |
| @react-navigation/drawer | ^6.x | Sidebar drawer navigation |
| @react-navigation/stack | ^6.x | Stack navigator for screens within drawer |
| react-native-gesture-handler | ~2.x | Required by drawer |
| react-native-reanimated | ~3.x | Required by drawer |
| react-native-screens | ~3.x | Native screen optimisation |
| react-native-safe-area-context | ^4.x | Notch/safe area handling |
| nativewind | ^4.x | Tailwind CSS in React Native |
| tailwindcss | ^3.4 | Tailwind config |
| zustand | ^4.x | Global state management |
| @tanstack/react-query | ^5.x | Server data fetching + caching |
| axios | ^1.x | HTTP client |
| expo-secure-store | ~13.x | Encrypted refresh token storage |
| react-native-mmkv | ^2.x | Fast sync key-value storage |
| expo-local-authentication | ~14.x | Face ID / fingerprint |
| react-hook-form | ^7.x | Form state management |
| zod | ^3.x | Schema validation |
| @hookform/resolvers | ^3.x | Connect Zod to react-hook-form |
| @react-native-community/netinfo | ^11.x | Network status detection |
| date-fns | ^3.x | Date formatting |
| @expo/vector-icons | ^14.x | MaterialCommunityIcons (included with Expo) |

---

## 4. Configure NativeWind

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary — terracotta (matches web --brand-primary)
        primary: {
          DEFAULT: '#CC785C',
          hover:   '#B8684F',
          pressed: '#9E5742',
          on:      '#FFFFFF',
        },
        // Backgrounds
        background: '#FAF9F5',   // --brand-bg
        surface: '#FFFFFF',      // --brand-surface
        'surface-muted': '#F0EEE6', // --brand-surface-muted
        // Text
        foreground: '#1F1E1D',   // --brand-ink
        muted: '#6B6862',        // --brand-ink-muted
        // Borders
        border: '#E8E6DC',       // --brand-border
        input: '#D6D3C7',        // --brand-input-border
        // Status
        success: '#5C8D5C',
        warning: '#C89B3C',
        destructive: '#C44536',  // error
        info: '#6B8CAE',
        // Dark mode overrides (use dark: prefix)
        dark: {
          background:  '#1F1E1D',
          surface:     '#262624',
          'surface-muted': '#2E2D2A',
          foreground:  '#F0EEE6',
          muted:       '#A8A49C',
          primary:     '#D97757',
          border:      '#3A3835',
          input:       '#4A4845',
        },
      },
      borderRadius: {
        sm:   '2px',
        md:   '4px',
        DEFAULT: '8px',
        lg:   '8px',
        xl:   '12px',
      },
      fontSize: {
        xs:   ['12px', { lineHeight: '16px' }],
        sm:   ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg:   ['18px', { lineHeight: '28px' }],
        xl:   ['20px', { lineHeight: '28px' }],
        '2xl':['24px', { lineHeight: '32px' }],
        '3xl':['30px', { lineHeight: '36px' }],
      },
    },
  },
  plugins: [],
};
```

### `babel.config.js`

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
```

### `metro.config.js`

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

### `global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 5. Environment Variables

### `.env`

```
EXPO_PUBLIC_API_URL=https://your-erp-domain.com
```

### Access in code

```ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

## 6. Theme Files

### `src/theme/colors.ts`

```ts
export const LightColors = {
  primary:             '#CC785C',
  primaryHover:        '#B8684F',
  primaryPressed:      '#9E5742',
  primaryForeground:   '#FFFFFF',
  background:          '#FAF9F5',
  surface:             '#FFFFFF',
  surfaceMuted:        '#F0EEE6',
  foreground:          '#1F1E1D',
  mutedForeground:     '#6B6862',
  border:              '#E8E6DC',
  inputBorder:         '#D6D3C7',
  success:             '#5C8D5C',
  warning:             '#C89B3C',
  error:               '#C44536',
  info:                '#6B8CAE',
  white:               '#FFFFFF',
  transparent:         'transparent',
} as const;

export const DarkColors: typeof LightColors = {
  ...LightColors,
  primary:             '#D97757',
  background:          '#1F1E1D',
  surface:             '#262624',
  surfaceMuted:        '#2E2D2A',
  foreground:          '#F0EEE6',
  mutedForeground:     '#A8A49C',
  border:              '#3A3835',
  inputBorder:         '#4A4845',
};

export type ColorKey = keyof typeof LightColors;
```

### `src/theme/radius.ts`

```ts
export const Radius = {
  sm:   2,
  md:   4,
  base: 8,
  lg:   8,
  xl:   12,
} as const;
```

### `src/theme/typography.ts`

```ts
export const FontSize = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
} as const;

export const FontWeight = {
  normal:   '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
};

export const LineHeight = {
  tight:  1.25,
  normal: 1.5,
  loose:  1.75,
} as const;
```

---

## 7. TypeScript Types

### `src/types/api.ts`

```ts
// Wrapper shape for all ERP API responses
export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  meta?:   PaginatedMeta;
  error?:  string | null;
}

export interface PaginatedMeta {
  total:    number;
  page:     number;
  limit:    number;
  totalPages: number;
}

export type Role = 'student' | 'teacher' | 'parent' | 'branch_admin' | 'super_admin';

export interface JWTPayload {
  userId:    string;
  studentId: string;
  branchId:  string;
  role:      Role;
  iat:       number;
  exp:       number;
}

export interface AuthUser {
  userId:    string;
  studentId: string;
  branchId:  string;
  role:      Role;
  name:      string;
  username:  string;
}
```

### `src/types/models.ts`

```ts
export interface Student {
  _id:            string;
  studentId:      string;
  admissionNumber:string;
  name:           string;
  phone?:         string;
  email?:         string;
  address?:       string;
  dateOfBirth?:   string;
  gender?:        string;
  bloodGroup?:    string;
  classId:        string;
  sectionId:      string;
  sessionId:      string;
  branchId:       string;
  rollNumber?:    string;
  className?:     string;
  sectionName?:   string;
}

export interface Session {
  _id:       string;
  name:      string;
  isActive:  boolean;
  branchId:  string;
  startYear: number;
  endYear:   number;
}
```

### `src/types/navigation.ts`

```ts
import type { StackNavigationProp } from '@react-navigation/stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

// ── Auth Stack ──────────────────────────────────────────────
export type AuthStackParamList = {
  Login:         undefined;
  ForgotPassword:undefined;
  ResetPassword: { username: string };
};

// ── Student Drawer ──────────────────────────────────────────
export type StudentDrawerParamList = {
  DashboardStack:    undefined;
  AttendanceStack:   undefined;
  FeesStack:         undefined;
  ResultsStack:      undefined;
  HomeworkStack:     undefined;
  TimetableStack:    undefined;
  LeavesStack:       undefined;
  NotificationsStack:undefined;
  ProfileStack:      undefined;
};

// ── Stack param lists for each drawer section ───────────────
export type DashboardStackParamList = {
  Dashboard: undefined;
};

export type AttendanceStackParamList = {
  Attendance: undefined;
};

export type FeesStackParamList = {
  Fees:       undefined;
  FeeReceipt: { feePaymentId: string };
};

export type ResultsStackParamList = {
  Results: undefined;
};

export type HomeworkStackParamList = {
  Homework:       undefined;
  HomeworkDetail: { homeworkId: string };
};

export type TimetableStackParamList = {
  Timetable: undefined;
};

export type LeavesStackParamList = {
  LeaveRequests: undefined;
  LeaveApply:    undefined;
};

export type NotificationsStackParamList = {
  Notifications:       undefined;
  NotificationDetail:  { notificationId: string };
};

export type ProfileStackParamList = {
  Profile:        undefined;
  ChangePassword: undefined;
};
```

---

## 8. Storage Helpers

### `src/services/storage.ts`

```ts
import { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';

// ── MMKV (fast, non-sensitive) ──────────────────────────────
export const storage = new MMKV({ id: 'oac-student-app' });

export const mmkv = {
  get:    (key: string): string | undefined       => storage.getString(key) ?? undefined,
  set:    (key: string, value: string): void      => storage.set(key, value),
  delete: (key: string): void                     => storage.delete(key),
  getBool:(key: string): boolean                  => storage.getBoolean(key) ?? false,
  setBool:(key: string, value: boolean): void     => storage.set(key, value),
};

// ── SecureStore (encrypted, for tokens) ────────────────────
export const secureStore = {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async delete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

// ── Storage keys ────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN:       'access_token',
  SAVED_USERNAME:     'saved_username',
  BIOMETRIC_ENABLED:  'biometric_enabled',
  REMEMBER_ME:        'remember_me',
} as const;

export const SECURE_KEYS = {
  REFRESH_TOKEN: 'refresh_token',
} as const;
```

---

## 9. API Client

### `src/services/api-client.ts`

```ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { mmkv, secureStore, STORAGE_KEYS, SECURE_KEYS } from './storage';
import { useAuthStore } from '../stores/auth-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// ── Create Axios instance ───────────────────────────────────
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — inject access token ───────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = mmkv.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — handle 401, refresh token ────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject:  (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await secureStore.get(SECURE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        const newAccessToken: string = data.data.accessToken;

        mmkv.set(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        useAuthStore.getState().setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Force logout
        mmkv.delete(STORAGE_KEYS.ACCESS_TOKEN);
        await secureStore.delete(SECURE_KEYS.REFRESH_TOKEN);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
```

---

## 10. Auth Service

### `src/services/auth-service.ts`

```ts
import { apiClient } from './api-client';
import type { ApiResponse, AuthUser } from '../types/api';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  user:         AuthUser;
  accessToken:  string;
  refreshToken: string;
  // Student-specific fields (populated from student record)
  studentId:    string;
  classId:      string;
  sectionId:    string;
  sessionId:    string;
  branchId:     string;
}

export interface ForgotPasswordPayload {
  username: string; // username or email
}

export interface ResetPasswordPayload {
  username: string;
  otp:      string;
  newPassword: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', payload);
    return data.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // best-effort — always clear local tokens even if server call fails
    }
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post('/api/auth/reset-password', payload);
  },
};
```

---

## 11. Zustand Stores

### `src/stores/auth-store.ts`

```ts
import { create } from 'zustand';
import type { AuthUser } from '../types/api';

interface AuthState {
  user:            AuthUser | null;
  accessToken:     string | null;
  isAuthenticated: boolean;
  isInitialized:   boolean;
  // Actions
  login:           (user: AuthUser, accessToken: string) => void;
  logout:          () => void;
  setAccessToken:  (token: string) => void;
  setInitialized:  (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  accessToken:     null,
  isAuthenticated: false,
  isInitialized:   false,

  login: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  setAccessToken: (token) =>
    set({ accessToken: token }),

  setInitialized: (value) =>
    set({ isInitialized: value }),
}));

// Selector hooks
export const useUser              = () => useAuthStore((s) => s.user);
export const useIsAuthenticated   = () => useAuthStore((s) => s.isAuthenticated);
export const useIsInitialized     = () => useAuthStore((s) => s.isInitialized);
```

### `src/stores/student-store.ts`

```ts
import { create } from 'zustand';

interface StudentState {
  studentId:   string | null;
  studentName: string | null;
  classId:     string | null;
  sectionId:   string | null;
  sessionId:   string | null;
  branchId:    string | null;
  className:   string | null;
  sectionName: string | null;
  rollNumber:  string | null;

  setStudentInfo: (info: Omit<StudentState, 'setStudentInfo' | 'clearStudentInfo'>) => void;
  clearStudentInfo: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  studentId:   null,
  studentName: null,
  classId:     null,
  sectionId:   null,
  sessionId:   null,
  branchId:    null,
  className:   null,
  sectionName: null,
  rollNumber:  null,

  setStudentInfo: (info) => set(info),
  clearStudentInfo: () =>
    set({
      studentId: null, studentName: null, classId: null,
      sectionId: null, sessionId: null, branchId: null,
      className: null, sectionName: null, rollNumber: null,
    }),
}));

// Selector hooks
export const useStudentId  = () => useStudentStore((s) => s.studentId);
export const useClassId    = () => useStudentStore((s) => s.classId);
export const useSectionId  = () => useStudentStore((s) => s.sectionId);
export const useSessionId  = () => useStudentStore((s) => s.sessionId);
export const useBranchId   = () => useStudentStore((s) => s.branchId);
```

---

## 12. Utility Helpers

### `src/utils/cn.ts`

```ts
// Classnames utility (like web cn() from lib/utils)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
```

### `src/utils/jwt.ts`

```ts
import type { JWTPayload } from '../types/api';

export function decodeJwt(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json      = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}
```

### `src/utils/format.ts`

```ts
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy');
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy, hh:mm a');
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

// Format Indian rupees: ₹1,23,456.00
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}
```

---

## 13. Shared Base Components

### `src/components/shared/AppButton.tsx`

Variants: `primary` | `secondary` | `outline` | `destructive` | `ghost`
Sizes: `sm` | `md` | `lg`
Props: `variant`, `size`, `loading` (bool — shows spinner + disables), `disabled`, `onPress`, `children`, `className`

```tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  disabled?: boolean;
  onPress?:  () => void;
  children:  React.ReactNode;
  className?:string;
}

const variantStyles: Record<Variant, string> = {
  primary:     'bg-primary active:bg-primary-pressed',
  secondary:   'bg-surface-muted active:opacity-80',
  outline:     'border border-border bg-transparent active:bg-surface-muted',
  destructive: 'bg-destructive active:opacity-80',
  ghost:       'bg-transparent active:bg-surface-muted',
};

const textStyles: Record<Variant, string> = {
  primary:     'text-white font-semibold',
  secondary:   'text-foreground font-medium',
  outline:     'text-foreground font-medium',
  destructive: 'text-white font-semibold',
  ghost:       'text-foreground font-medium',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 rounded-md',
  md: 'px-4 py-2.5 rounded-lg',
  lg: 'px-6 py-3 rounded-xl',
};

const textSizeStyles: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function AppButton({
  variant = 'primary', size = 'md', loading, disabled, onPress, children, className,
}: AppButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        'flex-row items-center justify-center',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50',
        className,
      )}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : '#CC785C'}
          className="mr-2"
        />
      )}
      {typeof children === 'string' ? (
        <Text className={cn(textStyles[variant], textSizeStyles[size])}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
```

---

### `src/components/shared/AppInput.tsx`

Props: `label`, `error`, `hint`, `leftIcon` (icon name string), `secureTextEntry` (auto-adds show/hide toggle), `...TextInputProps`

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cn } from '../../utils/cn';

interface AppInputProps extends TextInputProps {
  label?:      string;
  error?:      string;
  hint?:       string;
  leftIcon?:   string;
}

export function AppInput({ label, error, hint, leftIcon, secureTextEntry, style, ...rest }: AppInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-foreground mb-1">{label}</Text>
      )}
      <View
        className={cn(
          'flex-row items-center bg-surface border rounded-lg px-3',
          error ? 'border-destructive' : 'border-input',
        )}
      >
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon as any}
            size={20}
            color="#6B6862"
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          className="flex-1 py-2.5 text-base text-foreground"
          placeholderTextColor="#6B6862"
          secureTextEntry={secureTextEntry && !showPassword}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#6B6862"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-xs text-destructive mt-1">{error}</Text>}
      {hint && !error && <Text className="text-xs text-muted mt-1">{hint}</Text>}
    </View>
  );
}
```

---

### `src/components/shared/AppCard.tsx`

```tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../../utils/cn';

interface AppCardProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingStyles = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' };

export function AppCard({ padding = 'md', className, children, ...props }: AppCardProps) {
  return (
    <View
      className={cn('bg-surface rounded-xl border border-border', paddingStyles[padding], className)}
      {...props}
    >
      {children}
    </View>
  );
}
```

---

### `src/components/shared/AppBadge.tsx`

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'muted';

interface AppBadgeProps {
  variant?:  BadgeVariant;
  children:  string;
  className?:string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default:     { bg: 'bg-surface-muted', text: 'text-foreground' },
  success:     { bg: 'bg-success/10',    text: 'text-success' },
  warning:     { bg: 'bg-warning/10',    text: 'text-warning' },
  destructive: { bg: 'bg-destructive/10',text: 'text-destructive' },
  info:        { bg: 'bg-info/10',       text: 'text-info' },
  muted:       { bg: 'bg-surface-muted', text: 'text-muted' },
};

export function AppBadge({ variant = 'default', children, className }: AppBadgeProps) {
  const { bg, text } = variantStyles[variant];
  return (
    <View className={cn('px-2 py-0.5 rounded-full self-start', bg, className)}>
      <Text className={cn('text-xs font-medium', text)}>{children}</Text>
    </View>
  );
}
```

---

### `src/components/shared/AppLoader.tsx`

```tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface AppLoaderProps {
  fullScreen?: boolean;
  size?:       'small' | 'large';
}

export function AppLoader({ fullScreen = false, size = 'large' }: AppLoaderProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size={size} color="#CC785C" />
      </View>
    );
  }
  return (
    <View className="py-8 items-center">
      <ActivityIndicator size={size} color="#CC785C" />
    </View>
  );
}
```

---

### `src/components/shared/AppEmptyState.tsx`

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton } from './AppButton';

interface AppEmptyStateProps {
  icon:        string;
  title:       string;
  description?:string;
  ctaLabel?:   string;
  onCta?:      () => void;
}

export function AppEmptyState({ icon, title, description, ctaLabel, onCta }: AppEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <MaterialCommunityIcons name={icon as any} size={64} color="#D6D3C7" />
      <Text className="text-lg font-semibold text-foreground mt-4 text-center">{title}</Text>
      {description && (
        <Text className="text-sm text-muted mt-2 text-center">{description}</Text>
      )}
      {ctaLabel && onCta && (
        <AppButton onPress={onCta} className="mt-6">{ctaLabel}</AppButton>
      )}
    </View>
  );
}
```

---

### `src/components/shared/NoInternetBanner.tsx`

Shown at the top of every screen when the device has no internet connection. Uses `@react-native-community/netinfo`.

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function NoInternetBanner() {
  const [isConnected, setIsConnected] = React.useState<boolean | null>(true);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return unsubscribe;
  }, []);

  if (isConnected !== false) return null;

  return (
    <View className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex-row items-center">
      <MaterialCommunityIcons name="wifi-off" size={16} color="#C89B3C" />
      <Text className="text-xs text-warning font-medium ml-2">No internet connection</Text>
    </View>
  );
}
```

---

### `src/components/shared/SkeletonBlock.tsx`

Used for loading placeholders. Use `Animated` loop for shimmer effect.

```tsx
import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface SkeletonBlockProps {
  width?:   number | `${number}%`;
  height?:  number;
  radius?:  number;
  style?:   ViewStyle;
}

export function SkeletonBlock({ width = '100%', height = 16, radius = 8, style }: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: '#E8E6DC', opacity }, style]}
    />
  );
}
```

---

### `src/components/shared/AppToast.tsx` + `src/utils/toast.ts`

Simple global toast built on React Native `ToastAndroid` + custom overlay for iOS.

```tsx
// src/utils/toast.ts
import { ToastAndroid, Platform, Alert } from 'react-native';

// For a production app, replace with react-native-toast-message or similar.
// This is a minimal implementation that works cross-platform.

export const toast = {
  success: (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(`✓ ${message}`, ToastAndroid.SHORT);
    } else {
      // iOS: use a lightweight alternative; for now Alert
      Alert.alert('Success', message);
    }
  },
  error: (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(`✗ ${message}`, ToastAndroid.LONG);
    } else {
      Alert.alert('Error', message);
    }
  },
};
```

> **Note:** Replace with `react-native-toast-message` in Phase 12 for a proper toast UI with animations.

---

## 14. App.tsx — Root Entry Point

```tsx
import 'react-native-gesture-handler';
import './global.css';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      staleTime:          5 * 60 * 1000,   // 5 minutes
      gcTime:             10 * 60 * 1000,  // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 15. Implementation Steps (in order)

1. Run `npx create-expo-app student-app --template blank-typescript`
2. Install all dependencies (Section 2)
3. Create `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `global.css`
4. Create `.env` with `EXPO_PUBLIC_API_URL`
5. Create `src/theme/colors.ts`, `radius.ts`, `typography.ts`
6. Create `src/types/api.ts`, `models.ts`, `navigation.ts`
7. Create `src/utils/cn.ts`, `jwt.ts`, `format.ts`
8. Create `src/services/storage.ts`
9. Create `src/services/api-client.ts`
10. Create `src/services/auth-service.ts`
11. Create `src/stores/auth-store.ts`, `student-store.ts`
12. Create all shared components in `src/components/shared/`
13. Create stub `src/navigation/RootNavigator.tsx` (just renders a loading spinner for now)
14. Update `App.tsx`
15. Run `npx expo start` and verify app launches without errors

---

## 16. Verification Checklist

- [ ] `npx expo start` runs without errors
- [ ] NativeWind classes (`bg-primary`, `text-foreground`) apply correct colours in simulator
- [ ] `apiClient` has correct `baseURL` from env
- [ ] `mmkv.set('test', 'hello')` and `mmkv.get('test')` works
- [ ] `secureStore.set/get` works on device/simulator
- [ ] `useAuthStore` can be imported and `login()` / `logout()` toggle `isAuthenticated`
- [ ] `useStudentStore` can be imported and `setStudentInfo()` updates all fields
- [ ] All shared components render without errors (create a temporary test screen)
- [ ] `NoInternetBanner` appears when device wifi is turned off
- [ ] `decodeJwt()` and `isTokenExpired()` return correct values with a sample token
- [ ] TypeScript: `npx tsc --noEmit` passes with 0 errors
