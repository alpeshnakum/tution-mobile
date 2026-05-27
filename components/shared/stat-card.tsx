import { View, Text } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  bgColor?: string;
}

export function StatCard({ label, value, color = 'text-slate-900', bgColor = 'bg-white' }: StatCardProps) {
  return (
    <View className={`${bgColor} rounded-2xl p-4 flex-1 items-center border border-slate-100`}>
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
      <Text className="text-xs text-slate-500 mt-1 text-center">{label}</Text>
    </View>
  );
}
