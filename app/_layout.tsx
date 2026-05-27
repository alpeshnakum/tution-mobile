import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { Loading } from '@/components/shared/loading';
import { View } from 'react-native';

export default function RootLayout() {
  const { isLoading, isAuthenticated, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <Loading fullScreen message="Loading..." />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" redirect={isAuthenticated} />
      <Stack.Screen name="(app)" redirect={!isAuthenticated} />
    </Stack>
  );
}
