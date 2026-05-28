import '../global.css';
import { useEffect } from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { Colors } from '@/constants/colors';
import { Loading } from '@/components/shared/loading';
import { View } from 'react-native';
import { ErrorBoundary } from '@/components/shared/error-boundary';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: Colors.success, backgroundColor: Colors.surface }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: Colors.ink }}
      text2Style={{ fontSize: 13, color: Colors.inkMuted }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: Colors.error, backgroundColor: Colors.surface }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: Colors.ink }}
      text2Style={{ fontSize: 13, color: Colors.inkMuted }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: Colors.info, backgroundColor: Colors.surface }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: Colors.ink }}
      text2Style={{ fontSize: 13, color: Colors.inkMuted }}
    />
  ),
};

export default function RootLayout() {
  const { isLoading, isAuthenticated, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage().catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <ErrorBoundary>
        <View className="flex-1 bg-background">
          <Loading fullScreen message="Loading..." />
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" redirect={isAuthenticated} />
        <Stack.Screen name="(app)" redirect={!isAuthenticated} />
      </Stack>
      <Toast config={toastConfig} />
    </ErrorBoundary>
  );
}
