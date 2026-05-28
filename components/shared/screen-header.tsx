import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack, rightElement }: ScreenHeaderProps) {
  const router = useRouter();
  return (
    <View className="px-5 pt-4 pb-3 bg-white border-b border-border">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          {showBack && (
            <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
              <Text className="text-2xl text-primary">←</Text>
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">{title}</Text>
            {subtitle && <Text className="text-sm text-muted-foreground mt-0.5">{subtitle}</Text>}
          </View>
        </View>
        {rightElement}
      </View>
    </View>
  );
}
