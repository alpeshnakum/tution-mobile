import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({ onPress, title, variant = 'primary', loading, disabled, className }: ButtonProps) {
  const base = 'flex-row items-center justify-center rounded-xl px-6 py-3.5 active:opacity-80';
  const variants = {
    primary: 'bg-indigo-500',
    outline: 'border border-indigo-500 bg-transparent',
    ghost: 'bg-transparent',
  };
  const textVariants = {
    primary: 'text-white font-semibold text-base',
    outline: 'text-indigo-500 font-semibold text-base',
    ghost: 'text-indigo-500 font-medium text-base',
  };

  return (
    <TouchableOpacity
      className={`${base} ${variants[variant]} ${disabled || loading ? 'opacity-50' : ''} ${className || ''}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.primaryForeground : Colors.primary} size="small" />
      ) : (
        <Text className={textVariants[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
