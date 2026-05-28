import { useNetInfo } from '@react-native-community/netinfo';
import { View, Text } from 'react-native';

export function NoInternetBanner() {
  const netInfo = useNetInfo();

  if (netInfo.isConnected !== false) return null;

  return (
    <View className="bg-danger px-4 py-2 flex-row items-center justify-center gap-2">
      <Text className="text-white text-xs font-semibold">No internet connection</Text>
    </View>
  );
}
