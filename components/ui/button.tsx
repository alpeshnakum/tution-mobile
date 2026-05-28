import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: object;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  loading,
  disabled,
  className,
  style,
}: ButtonProps) {
  const containerStyle = (() => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: Colors.primary };
      case 'outline':
        return { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'destructive':
        return { backgroundColor: Colors.error };
    }
  })();

  const textColor = (() => {
    switch (variant) {
      case 'primary':     return Colors.primaryOn;
      case 'outline':     return Colors.ink;
      case 'ghost':       return Colors.primary;
      case 'destructive': return Colors.errorOn;
    }
  })();

  const spinnerColor = (() => {
    switch (variant) {
      case 'primary':     return Colors.primaryOn;
      case 'outline':     return Colors.primary;
      case 'ghost':       return Colors.primary;
      case 'destructive': return Colors.errorOn;
    }
  })();

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center rounded-xl px-6 py-3.5 ${disabled || loading ? 'opacity-50' : ''} ${className || ''}`}
      style={[containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <Text className="text-base font-semibold" style={{ color: textColor }}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
