import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 gap-4">
      <View className="w-14 h-14 bg-red-100 rounded-full items-center justify-center">
        <Text className="text-2xl">⚠️</Text>
      </View>
      <Text className="text-foreground text-base font-medium text-center">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          className="px-5 py-2.5 bg-primary rounded-xl active:opacity-80"
          onPress={onRetry}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
