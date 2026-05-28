import { View, Text } from 'react-native';
import { AlertIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/colors';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View
      className="flex-1 items-center justify-center px-6 gap-4"
      style={{ backgroundColor: Colors.bg }}
    >
      <AlertIcon size={48} color={Colors.error} />
      <Text className="text-sm text-center" style={{ color: Colors.inkMuted }}>{message}</Text>
      {onRetry && (
        <Button title="Try Again" variant="outline" onPress={onRetry} />
      )}
    </View>
  );
}
