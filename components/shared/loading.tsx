import { View, ActivityIndicator, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = 'Loading...', fullScreen }: LoadingProps) {
  return (
    <View
      className={`items-center justify-center gap-3 ${fullScreen ? 'flex-1' : 'py-12'}`}
      style={fullScreen ? { backgroundColor: Colors.bg } : undefined}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text className="text-sm" style={{ color: Colors.inkMuted }}>{message}</Text>
    </View>
  );
}
