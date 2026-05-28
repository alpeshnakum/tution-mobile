import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  bgColor?: string;
  textColor?: string;
}

export function StatCard({
  label,
  value,
  bgColor = Colors.sidebarActive,
  textColor = Colors.primary,
}: StatCardProps) {
  return (
    <View
      className="flex-1 rounded-xl p-3 items-center"
      style={{ backgroundColor: bgColor }}
    >
      <Text className="text-2xl font-bold" style={{ color: textColor }}>
        {value}
      </Text>
      <Text className="text-xs mt-1 text-center" style={{ color: Colors.inkMuted }}>{label}</Text>
    </View>
  );
}
