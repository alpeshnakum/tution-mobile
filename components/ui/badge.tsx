import { View, Text } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'default' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, { container: string; text: string }> = {
  success: { container: 'bg-green-100', text: 'text-green-700' },
  warning: { container: 'bg-amber-100', text: 'text-amber-700' },
  danger: { container: 'bg-red-100', text: 'text-red-700' },
  primary: { container: 'bg-indigo-100', text: 'text-indigo-700' },
  default: { container: 'bg-slate-100', text: 'text-slate-600' },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const v = variants[variant];
  return (
    <View className={`px-2.5 py-1 rounded-full self-start ${v.container}`}>
      <Text className={`text-xs font-semibold ${v.text}`}>{label}</Text>
    </View>
  );
}
