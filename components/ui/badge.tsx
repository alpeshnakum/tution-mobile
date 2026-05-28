import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'default' | 'primary' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; textColor: string }> = {
  default:  { bg: Colors.surfaceMuted, textColor: Colors.inkMuted },
  primary:  { bg: Colors.sidebarActive, textColor: Colors.primaryPressed },
  success:  { bg: Colors.successBg, textColor: Colors.success },
  warning:  { bg: Colors.warningBg, textColor: Colors.warning },
  danger:   { bg: Colors.errorBg, textColor: Colors.error },
  info:     { bg: Colors.infoBg, textColor: Colors.info },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <View
      className="px-2.5 py-0.5 rounded-full self-start"
      style={{ backgroundColor: v.bg }}
    >
      <Text className="text-xs font-medium" style={{ color: v.textColor }}>
        {label}
      </Text>
    </View>
  );
}
