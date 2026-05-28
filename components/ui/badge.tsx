import { View, Text } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'default' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, { container: string; text: string }> = {
  success: { container: 'bg-success-light', text: 'text-success' },
  warning: { container: 'bg-warning-light', text: 'text-warning' },
  danger: { container: 'bg-danger-light', text: 'text-danger' },
  primary: { container: 'bg-primary-light', text: 'text-primary' },
  default: { container: 'bg-primary-light', text: 'text-muted-foreground' },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const v = variants[variant];
  return (
    <View className={`px-2.5 py-1 rounded-full self-start ${v.container}`}>
      <Text className={`text-xs font-semibold ${v.text}`}>{label}</Text>
    </View>
  );
}
