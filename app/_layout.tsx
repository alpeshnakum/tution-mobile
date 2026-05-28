import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { Loading } from '@/components/shared/loading';
import { View } from 'react-native';
import { ErrorBoundary } from '@/components/shared/error-boundary';

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
    </ErrorBoundary>
  );
}
