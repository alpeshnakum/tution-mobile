# Phase 12 — Polish, Dark Mode & Deployment

> **Goal:** Final polish pass — implement dark mode across all screens, improve toast notifications with proper UI, ensure consistent loading/empty states everywhere, run full TypeScript and lint checks, then build and publish via EAS Build to Google Play and App Store.
>
> **Depends on:** All phases 01–11 complete and verified.
>
> **No new backend APIs required.**

---

## 1. Dark Mode

### Overview

The app already defines `DarkColors` in `src/theme/colors.ts` (Phase 01). Phase 12 activates it by wiring `useColorScheme()` through all components.

### Implementation Approach

Use a theme context that wraps the app and provides the current colour set. All components import `useTheme()` instead of hardcoding colour strings.

### `src/theme/ThemeContext.tsx`

```tsx
import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors } from './colors';
import type { ColorKey } from './colors';

type ThemeColors = typeof LightColors;

interface ThemeContextValue {
  colors:    ThemeColors;
  isDark:    boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: LightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### Update `App.tsx`

Wrap `RootNavigator` with `ThemeProvider`:

```tsx
import { ThemeProvider } from './src/theme/ThemeContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <RootNavigator />
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### Update Navigation Theme

In `StudentDrawer.tsx`, pass a dynamic React Navigation theme based on `isDark`:

```tsx
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

// Inside StudentDrawer:
const { isDark, colors } = useTheme();

const navTheme = {
  ...(isDark ? DarkTheme : DefaultTheme),
  colors: {
    ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
    background: colors.background,
    card:       colors.surface,
    text:       colors.foreground,
    border:     colors.border,
    primary:    colors.primary,
  },
};

// In NavigationContainer (RootNavigator.tsx):
<NavigationContainer theme={navTheme}>
```

### NativeWind Dark Mode

NativeWind v4 reads from `useColorScheme()` automatically. Ensure `dark:` variants are used on elements that need dark-mode overrides:

```tsx
// Example: card background
<View className="bg-surface dark:bg-dark-surface" />
// Example: text
<Text className="text-foreground dark:text-dark-foreground" />
```

**Go through each component file and add `dark:` variants where the background or text colour differs between light and dark.**

Key elements to update:
| Element | Light | Dark |
|---------|-------|------|
| Screen background | `bg-background` | `dark:bg-dark-background` |
| Card background | `bg-surface` | `dark:bg-dark-surface` |
| Muted background | `bg-surface-muted` | `dark:bg-dark-surface-muted` |
| Primary text | `text-foreground` | `dark:text-dark-foreground` |
| Muted text | `text-muted` | `dark:text-dark-muted` |
| Borders | `border-border` | `dark:border-dark-border` |
| Inputs | `border-input` | `dark:border-dark-input` |
| `DrawerContent` sidebar | `bg-background` | `dark:bg-dark-background` |
| Skeleton blocks | `bg-[#E8E6DC]` | `dark:bg-[#3A3835]` |
| `WelcomeCard` | `bg-primary` | unchanged (terracotta stays) |

---

## 2. Replace Toast with `react-native-toast-message`

The Phase 01 `toast` utility used `ToastAndroid`/`Alert` — a temporary implementation. Replace it with `react-native-toast-message` for proper animated toasts on both platforms.

### Install

```bash
npm install react-native-toast-message
```

### Setup in `App.tsx`

```tsx
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ... providers ... */}
      <RootNavigator />
      <Toast /> {/* Must be last child, renders above everything */}
    </GestureHandlerRootView>
  );
}
```

### Update `src/utils/toast.ts`

```ts
import Toast from 'react-native-toast-message';

export const toast = {
  success: (message: string, title?: string) =>
    Toast.show({ type: 'success', text1: title ?? 'Success', text2: message }),

  error: (message: string, title?: string) =>
    Toast.show({ type: 'error', text1: title ?? 'Error', text2: message }),

  info: (message: string, title?: string) =>
    Toast.show({ type: 'info', text1: title ?? 'Info', text2: message }),
};
```

---

## 3. Add Date Picker for Leave Apply

Replace the plain text `fromDate`/`toDate` inputs in `LeaveApplyScreen` (Phase 09) with a proper date picker.

### Install

```bash
npx expo install @react-native-community/datetimepicker
```

### Usage in `LeaveApplyScreen.tsx`

```tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

// In component state:
const [showFromPicker, setShowFromPicker] = useState(false);
const [showToPicker,   setShowToPicker]   = useState(false);

// Replace AppInput with:
<TouchableOpacity onPress={() => setShowFromPicker(true)}>
  <AppInput
    label="From Date"
    value={fromDate ? format(new Date(fromDate), 'dd MMM yyyy') : ''}
    editable={false}
    leftIcon="calendar-start"
    placeholder="Select from date"
  />
</TouchableOpacity>

{showFromPicker && (
  <DateTimePicker
    value={fromDate ? new Date(fromDate) : new Date()}
    mode="date"
    minimumDate={new Date()}
    onChange={(_, date) => {
      setShowFromPicker(false);
      if (date) setValue('fromDate', format(date, 'yyyy-MM-dd'));
    }}
  />
)}
```

---

## 4. Consistency Audit

Go through every screen and verify:

| Check | All Screens |
|-------|-------------|
| Loading state | `AppLoader` or screen-specific skeleton shown while `isLoading` |
| Error state | `AppEmptyState` with icon + Retry button shown on `isError` |
| Empty state | `AppEmptyState` with relevant icon + message when data is empty |
| Pull-to-refresh | `RefreshControl` on every `ScrollView` / `FlatList` |
| `NoInternetBanner` | Present at top of every screen |
| `SafeAreaView` | All screens respect device notch/home indicator |

---

## 5. TypeScript Strict Check

Run and fix all TypeScript errors:

```bash
npx tsc --noEmit --strict
```

Common issues to fix:
- Remove all `as any` casts and replace with proper types
- Add return types to all functions
- Ensure all optional props are handled with nullish coalescing
- Fix any implicit `any` in event handlers

---

## 6. EAS Build Setup

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Configure `eas.json`

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios":     { "simulator": true }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios":     {}
    }
  },
  "submit": {
    "production": {
      "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "production" },
      "ios":     { "appleId": "your@apple.id", "ascAppId": "your_app_store_connect_app_id" }
    }
  }
}
```

### Configure `app.json`

```json
{
  "expo": {
    "name":   "OAC Student",
    "slug":   "oac-student",
    "version":"1.0.0",
    "orientation": "portrait",
    "icon":   "./assets/images/logo.png",
    "splash": {
      "image":           "./assets/images/logo.png",
      "resizeMode":      "contain",
      "backgroundColor": "#FAF9F5"
    },
    "ios": {
      "supportsTablet":  false,
      "bundleIdentifier":"com.oac.student",
      "infoPlist": {
        "NSFaceIDUsageDescription": "Enable Face ID for faster login"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage":  "./assets/images/logo.png",
        "backgroundColor":  "#CC785C"
      },
      "package": "com.oac.student",
      "permissions": [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    "plugins": [
      "expo-secure-store",
      "expo-local-authentication",
      [
        "@react-native-community/datetimepicker",
        { "android": { "datepicker": true } }
      ]
    ]
  }
}
```

---

## 7. Build Commands

### Development build (for testing on device)

```bash
# Android APK for internal testing
eas build --platform android --profile preview

# iOS Simulator build
eas build --platform ios --profile preview
```

### Production build

```bash
# Both platforms
eas build --platform all --profile production
```

### Submit to stores

```bash
# After production build completes:
eas submit --platform android --profile production
eas submit --platform ios     --profile production
```

---

## 8. Pre-Launch Checklist

### Security
- [ ] No hardcoded API keys, tokens, or secrets in source code
- [ ] `.env` file is in `.gitignore`
- [ ] `console.log` statements with sensitive data removed (token values, passwords)
- [ ] HTTPS enforced (API base URL uses `https://`)

### Functionality
- [ ] All 12 phases verified end-to-end on a real device (not just simulator)
- [ ] Test on both iOS (iPhone) and Android (physical device or emulator)
- [ ] Test with a real student account that has complete data
- [ ] Login → all screens load without crash
- [ ] Logout → clears state → shows Login screen
- [ ] Token refresh works (wait for token to expire, verify app stays logged in)
- [ ] Biometric login works on a real device

### UI/UX
- [ ] Dark mode looks correct on both platforms
- [ ] All text is readable in both light and dark mode
- [ ] No clipped text or overflowing layout on small screens (iPhone SE, small Android)
- [ ] All loading states use the skeleton/spinner (no blank white screens)
- [ ] All empty states show a helpful message
- [ ] Toasts appear and auto-dismiss
- [ ] No leftover "Coming in Phase XX" stub text

### Performance
- [ ] App cold start < 3 seconds
- [ ] Screen transitions are smooth (60fps)
- [ ] No memory warnings during normal use
- [ ] Large notification list (50+ items) scrolls smoothly

### TypeScript
- [ ] `npx tsc --noEmit --strict` passes with 0 errors

---

## 9. Implementation Steps (in order)

1. Install `react-native-toast-message` and update `App.tsx` + `src/utils/toast.ts`
2. Install `@react-native-community/datetimepicker` and update `LeaveApplyScreen.tsx`
3. Create `src/theme/ThemeContext.tsx`
4. Update `App.tsx` with `ThemeProvider`
5. Update `RootNavigator.tsx` to pass dynamic nav theme
6. Update `StudentDrawer.tsx` for dark mode
7. Go through all components and add `dark:` NativeWind variants (see table above)
8. Update `DrawerContent.tsx` for dark mode
9. Run `npx tsc --noEmit --strict` and fix all errors
10. Test on iOS simulator — dark mode toggle in system settings
11. Test on Android emulator — dark mode toggle in system settings
12. Set up EAS project: `eas init`
13. Configure `eas.json` and `app.json`
14. Build preview APK: `eas build --platform android --profile preview`
15. Install APK on physical Android device, run full smoke test
16. Build production: `eas build --platform all --profile production`
17. Submit to stores

---

## 10. Verification Checklist

- [ ] Dark mode activates when device is in dark mode
- [ ] All screens look correct in dark mode (no white flashes, no invisible text)
- [ ] `react-native-toast-message` shows animated toasts on both iOS and Android
- [ ] Date picker works on Leave Apply screen (both iOS and Android)
- [ ] `npx tsc --noEmit --strict` passes with 0 errors
- [ ] EAS build completes without errors
- [ ] APK installs and runs on Android 8+ device
- [ ] IPA runs on iOS 14+ device
- [ ] Full end-to-end smoke test passed on physical device
- [ ] App Store / Play Store submission accepted
