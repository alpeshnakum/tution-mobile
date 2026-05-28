import { View } from 'react-native';
import { Stack } from 'expo-router';
import { NoInternetBanner } from '@/components/shared/no-internet-banner';

export default function AuthLayout() {
  return (
    <View className="flex-1">
      <NoInternetBanner />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
